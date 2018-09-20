# zenodo-upload-jquery 


This is about uploading data on Zenodo from your application using jQuery. The researchers can publish their data on Zenodo from within your platform, without the need to separately log into Zenodo for publishing their data. 

Zenodo provides a rich API which allows third ­party tools and services to use Zenodo majorily in the backend in their own workflows. But using backend may hinder user's privacy as access token or other authentication infrmation may be needed to store in database then.
So executing on client side will ensure user's privacy as you'll not need to store user's personal data like contact information and log-in credentials of the third party tools, on your databases, which would otherwise give you complete access to user's Zenodo account. You can store access token in localStorage.

In this repository I haven't described about storing access token in localstorage as this was just a demo project. You can find below the code for storing access token on local storage.

### Follow these steps :


1. Provide an option in your application to login with Zenodo.

2. When user clicks on Login button, zenodo oauth API is called, it authenticates the user and returns the 'access token'. A    personal access token works just like a normal OAuth access token for authentication against the API. It is shown below that how to call Zenodo auth api.


        <a target="_blank" href="https://zenodo.org/oauth/authorize?scope=deposit:write+deposit:actions&state=CHANGEME&redirect_uri=<redirect_page_uri>&response_type=code&client_id=<client_id>">
          Login With Zenodo
        </a>


    
    Here, in 'href' attribute, a 'GET' request has been made to zenodo oauth API (https://zenodo.org/oauth/authorize) having  these parameters -
    

    **scope** - Scopes assign permissions to your personal access token to limit access to data and actions in Zenodo. The  possible values of scope are :
      1. deposit:actions - Allow publishing of uploads.
      2. deposit:write - Allow upload (but not publishing).
      3. user:email - Allow access to email address (read-only). 
      
    **state** - 'CHANGEME'  
    **response_type** - 'code'  
    **client_id** - <your_own_client_id>  
    **redirect_uri** - <your_own_redirect_uri> : This is the url of the page in your application, where Zenodo will redirect the user after authenticating. (For ex. in my application - https://openreuse.org/zenodo_callback.html) In this page you can show loader and execute the below script to get access token.
    
    
        // zenodo_callback.html
       $.ajax({
           url: '/backend/zenodo_token_callback',
           dataType: 'json',
           data: {
               'code': <your_own_code>   //described below
           },
           success: function(data){
               localStorage.setItem("zenodo_application_token", data.access_token);
               window.close();
           }
       });
       
       
Note : Here we are calling an API which is written in our backend as if called in frontend, this will reveal your client secret to the users. Also we are not saving access token in backend, we're just returning the response to clientside. So whenever user logs in, he'll have to re-authorize himself. Call this api (https://zenodo.org/oauth/token) in backend & get access token in 'zenodo_callback.html'. I'm using python here in backend. You can use any language in which you are comfortable.


        @app.route('/backend/zenodo_token_callback')
        def zenodo_callback():
            code = request.args.get('code', '')
            r = requests.post("https://zenodo.org/oauth/token",
                  data = {
                      'client_id': <your_own_client_id>,
                      'client_secret': <your_own_client_secret>,
                      'grant_type': 'authorization_code',
                      'code' : <your_own_code>,
                      'redirect_uri': <your_own_redirect_uri>
                  }
                )
            data = r.json()
            return app.response_class(
                response=json.dumps(data),
                status=200,
                mimetype='application/json'
            )
            
         
  Here, 'client_id' and 'client_secret' are the keys which you get after signing in with a developers account on Zenodo. The 'code' comes from the parameter of the url of the current page, i.e. redirect page. So here's the flow.

   -  You click on Login button
   -  Zenodo oauth api is called and an authorization window opens
   -  You click on 'Authorize Application' button.
   -  This redirects you to the page whose url you passed in the 'redirect_uri'. Also it appends 'code' in the url. (For ex. https://openreuse.org/zenodo_callback.html?code=W6qVexybyUio8mHzU4FBy8W51XONS)
   -  Now you are on the redirected page. Here, first you retrieve 'code' from url & make an AJAX call passing the above code & you get access token in response.
   -  Now set that access token in local storage to be used further for user authentication.
   -  Also close the window & come back to your application page.
   
   
Now you have access token stored in localstorage. Call the Zenodo api to create a new upload.
