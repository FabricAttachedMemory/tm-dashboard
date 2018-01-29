# tm-dashboard
A replacement for the "Face of The Machine" monitoring GUI.

Webpage hosted by github pages: https://fabricattachedmemory.github.io/tm-dashboard/

# How To


### Install and Run

 1. git clone https://github.com/FabricAttachedMemory/tm-dashboard.git
 2. Create a symlink from /usr/lib/python3/dist-packages/tm_dashboard into cloned tm-dashboard:     
    * sudo ln -s tm-dashboard /usr/lib/python3/dist-packages/tm_dashboard
    
    ###### NOTE: underscore in the symlink, instead of dash.
 3. cd tm-dashboard
 4. ./matryoshka_api.py
 5. In the different terminal open: 
    * chromium tm-dashboard/static/dashboard.html
    
 ###### (Optional)
 If you need to re-compile dashboard.html or do any frontend development of this application, you need to install Nodejs and npm.
 Follow this guide:
  https://nodejs.org/en/download/package-manager/
  
 Then, to recompile dashboard.html run:
  - tm-dashboard/static/compile
