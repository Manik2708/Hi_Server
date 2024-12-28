package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/Manik2708/Hi_Server/QueueService/pkg/server"
)

func main() {
	port := flag.Int("port", 50051, "Port to listen on")
	s := server.CoreServer{}
	err := s.New(*port)
	if err != nil {
		fmt.Print(err.Error())
		os.Exit(1)
	}
}
