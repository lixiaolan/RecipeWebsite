#Define the compile command to be used :
CC = g++ -std=c++11
#Define the flags to be used with the compilestatment :
CFLAGS = -g -Wall

#Define the rules in the dependancy tree :
server : server.cpp
	$(CC) -o $@ $^ -L. -lljjhttpserver -Wl,-rpath,/usr/local/lib $(CFLAGS)

clean:
	rm -f $(SRC)*.o
	rm server

#Notes: $@ means "lhs of : ",
#	$^ means "rhs of : ",
#	$< means "first term on rhs of : ".x
