#include "HTTP_Server.hpp"
#include "HTTP_Example_Handlers.hpp"
#include <iostream>               // for std::cout
#include <sys/wait.h>

using namespace std;

// Function to handle the fork exec process for a sytem command
// specified by single string.
void SystemCall(string command) {
  vector<string> commandPieces;
  istringstream iss(command);
  string commandPiece;

  // Parse out the command string
  while (iss >> commandPiece) {
    commandPieces.push_back(commandPiece);
  }

  // Create command to run
  char* arg_list[commandPieces.size()+1];
  for (unsigned i = 0; i < commandPieces.size(); i++) {
    arg_list[i] = const_cast<char*>(commandPieces[i].c_str());
  }
  arg_list[commandPieces.size()] = NULL;
  
  // char* arg_list[] = {"sh", "writeDirToFile.sh", dirPath, "dir", NULL};
  char* program = arg_list[0];
    
  // Run code to create new file with specified name
  pid_t child_pid;
  int child_status;
    
  // Fork
  child_pid = fork();

  if (child_pid != 0) {
    // Wait for child (if parrent)
    wait(&child_status);

    // Handle errors if any:
    if (WIFEXITED (child_status))
      printf ("the child process exited normally, with exit code %d\n",
              WEXITSTATUS (child_status));
    else
      printf ("the child process exited abnormally\n");
  }
  else {
    // Exec (if child)
    execvp(program, arg_list);
    // Only get here if execvp fails
    fprintf(stderr, "an error orccured in execvp\n");
    abort();
  }
}

class ImportHandler : public HTTP_Handler
{
public:
  bool Process(HTTP_Request* request, HTTP_Response* response) override
  {

    
    if (request->method != "GET") return false;
    if (request->requestURI.find("import") == string::npos) return false;

    string searchString = "import?";
    int p = request->requestURI.find(searchString) + searchString.length();
    string url = request->requestURI.substr(p);
    
    SystemCall("sh get.sh " + url + " import.html");

    string file = "./import.html";
    string line;
    ifstream myfile(file);
    
    if (myfile.is_open()) {
      while (getline(myfile,line)) {
        response->body += line + "\n";
      }
      myfile.close();
    }    
    
    return true;
  }
};

// Class to handle the case where the input from POST or PUT is
// blank. This handles the request to prevent the file handler for
// overwriting good files and returns "fail" in the response body.
class BlankHandler : public HTTP_Handler
{
public:
  bool Process(HTTP_Request* request, HTTP_Response* response) override
  {
    if ((request->method == "PUT") || (request->method == "POST")) {
      if (request->body == "") {
        response->body = "fail";
        return true;
      }
    }
    return false;
  }
};


// This "handles" a POST or PUT if it does not match the security
// string. "handling" the request prevents any other handler from
// taking effect.
class SecurityTest : public HTTP_Handler
{
public:
  bool Process(HTTP_Request* request, HTTP_Response* response) override
  {
    // Get authentication string from security file:
    ifstream ifs("./security");
    string password;
    getline(ifs, password);

    // Get authorization header string;
    string authorizationHeader = request->headers["Authorization"];

    // If requesting the security file, return if file matches the
    // Authentication (yes or no)
    if (request->requestURI == "/security") {
      if (request->headers["Authorization"].compare(password) == 0) {
        response->body = "yes";
      }
      else {
        response->body = "no";
      }
      return true;
    }

    // Otherwise, if this is any POST or PUT, check security:    
    if ((request->method != "POST") &&
        (request->method != "PUT")) return false;
    
    // Compare authentication string to header
    if (request->headers["Authorization"].compare(password) != 0) {
      response->body = "no";
      return true;
    }

    return false;
  }
};


int main(int argc, char *argv[]) {
  while(1) {
    try {
      // Create handlers:
      SecurityTest ST;
      HTTP_File_Handler FH;
      ImportHandler IH;
      BlankHandler BH;
      // Create server
      HTTP_Server server;
      
      // add handlers
      server.handlers.push_back(&ST);
      server.handlers.push_back(&BH);
      server.handlers.push_back(&FH);
      server.handlers.push_back(&IH);
      
      // Set to 8000 instead of 80
      // char socket[5] = "8000";
      // strcpy(server.socket, socket);
      
      server.Run();
    }
    catch(...) {

    }
  }
  return 1;
}
