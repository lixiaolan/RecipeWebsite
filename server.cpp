#include "HTTP_Server.hpp"
#include "HTTP_Example_Handlers.hpp"
#include <iostream>               // for std::cout
#include <sys/wait.h>

using namespace std;


class SaveRecipes : public HTTP_Handler
{
public:
  bool Process(HTTP_Request* request, HTTP_Response* response) override
  {
    if (request->method != "POST") return false;
    string searchTokin = "recipes.json";
    // Determine if this handler has 'recipes.json' in the uri
    if (request->requestURI.find(searchTokin) == string::npos) return false;

    istringstream iss(request->body);
    string filePath = "recipes.json";
    ofstream ofs(filePath);
    string line;
    while (getline(iss,line)) {
      ofs << line << "\n";
    }

    response->body = "Saved!";
    
    return true;
  }
};

class SaveRecipeText : public HTTP_Handler
{
public:
  bool Process(HTTP_Request* request, HTTP_Response* response) override
  {
    if (request->method != "POST") return false;
    string searchTokin = "recipes/";
    // Determine if this handler has 'recipes.json' in the uri
    if (request->requestURI.find(searchTokin) == string::npos) return false;

    istringstream iss(request->body);

    // Need the . to keep file path local
    string filePath = "." + request->requestURI;
    ofstream ofs(filePath);
    string line;
    while (getline(iss,line)) {
      ofs << line << "\n";
    }

    response->body = "Saved!";
    
    cout << "Handled in SaveRecipeText" << endl;
    return true;
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
      cout << "Handled in SecurityTest" << endl;
      return true;
    }

    // Otherwise, if this is any POST or PUT, check security:    
    if ((request->method != "POST") &&
        (request->method != "PUT")) return false;
    
    // Compare authentication string to header
    if (request->headers["Authorization"].compare(password) != 0) {
      response->body = "no";
      cout << "Handled in SecurityTest" << endl;
      return true;
    }

    return false;
  }
};


int main(int argc, char *argv[]) {
   
  // Create handlers:
  SecurityTest ST;
  HTTP_File_Handler FH;
  SaveRecipeText SRT;
  SaveRecipes SR;
  
  // Create server
  HTTP_Server server;

  // add handlers
  server.handlers.push_back(&ST);
  server.handlers.push_back(&SR);
  server.handlers.push_back(&SRT);
  server.handlers.push_back(&FH);
  
  server.Run();
  
  return 1;
}
