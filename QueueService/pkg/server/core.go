package server

import (
	"context"
	"encoding/binary"
	"errors"
	"fmt"
	"github.com/dgraph-io/badger/v4"
	"io"
	"net"
	"os"
	"strconv"
	"time"

	pb "github.com/Manik2708/Hi_Server/QueueService/pkg/grpc"
	"google.golang.org/grpc"
)

type CoreServer struct {
	port  int
	store *badger.DB
	pb.UnimplementedQueueServiceServer
	io.Closer
}

func (c *CoreServer) GetMessages(rq *pb.GetMessagesRequest, s grpc.ServerStreamingServer[pb.GetMessagesResponse]) error {
	return c.store.View(func(txn *badger.Txn) error {
		idKey := []byte(rq.Id)
		opts := &badger.IteratorOptions{}
		opts.Reverse = true
		it := txn.NewIterator(*opts)
		defer it.Close()
		for it.Seek(idKey); it.Valid(); it.Next() {
			err := it.Item().Value(func(val []byte) error {
				return s.Send(&pb.GetMessagesResponse{Id: rq.Id, Content: val})
			})
			if err != nil {
				return err
			}
		}
		return nil
	})
}

func (c *CoreServer) DeleteMessages(_ context.Context, rq *pb.GetMessagesRequest) (*pb.SaveMessageResponse, error) {
	err := c.store.Update(func(txn *badger.Txn) error {
		idKey := []byte(rq.Id)
		opts := &badger.IteratorOptions{}
		opts.PrefetchValues = false
		it := txn.NewIterator(*opts)
		defer it.Close()
		for it.Seek(idKey); it.Valid(); it.Next() {
			err := txn.Delete(it.Item().Key())
			if err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return &pb.SaveMessageResponse{Success: true}, nil
}

func (c *CoreServer) SaveMessage(_ context.Context, rq *pb.SaveMessageRequest) (*pb.SaveMessageResponse, error) {
	err := c.store.Update(func(txn *badger.Txn) error {
		entry, err := createBadgerEntry(rq.Id, rq.Content)
		if err != nil {
			return err
		}
		return txn.SetEntry(entry)
	})
	if err != nil {
		return nil, err
	}
	return &pb.SaveMessageResponse{Success: true}, nil
}

func createBadgerEntry(id string, content []byte) (*badger.Entry, error) {
	if id == "" {
		return nil, errors.New("cannot create badger entry, id is empty")
	}
	key := make([]byte, len(id)+8)
	copy(key, id)
	binary.BigEndian.PutUint64(key, uint64(time.Now().UnixNano()/1000))
	return &badger.Entry{Key: key, Value: content}, nil
}

func (c *CoreServer) New(port int) error {
	dir, err := os.MkdirTemp("", "badger")
	if err != nil {
		return err
	}
	store, err := badger.Open(badger.DefaultOptions(dir))
	if err != nil {
		return err
	}
	c.store = store
	c.port = port
	lis, err := net.Listen("tcp", ":"+strconv.Itoa(port))
	if err != nil {
		return err
	}
	s := grpc.NewServer()
	pb.RegisterQueueServiceServer(s, &CoreServer{})
	fmt.Printf("gRPC Server created with port number %d\n", c.port)
	err = s.Serve(lis)
	if err != nil {
		return err
	}
	return nil
}

func (c *CoreServer) Close() error {
	return c.store.Close()
}
