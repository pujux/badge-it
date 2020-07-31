# git-badges

### Useful badges for your GitHub Profile README 🎉

All endpoints support the query parameters that you can also use for [shields.io](https://shields.io) badges.

## Currently available:

- [![Visits Badge](https://badges.pufler.dev/visits/puf17640/git-badges)](https://badges.pufler.dev) <br>
  `https://badges.pufler.dev/visits/{username}/{repo}`
  
  Returns a badge containing the page hit counter for your repository
  
  Markdown Code: <br>`[![Visits Badge](https://badges.pufler.dev/visits/puf17640/git-badges)](https://badges.pufler.dev)`

- [![Visits Badge](https://badges.pufler.dev/years/puf17640)](https://badges.pufler.dev) <br>
  `https://badges.pufler.dev/years/{username}`
  
  Returns a badge containing the number of years you have been a member
  
  Markdown Code: <br>`[![Years Badge](https://badges.pufler.dev/years/puf17640)](https://badges.pufler.dev)`

- [![Repos Badge](https://badges.pufler.dev/repos/puf17640)](https://badges.pufler.dev) <br>
  `https://badges.pufler.dev/repos/{username}`
  
  Returns a badge containing the number of your public repositories
  
  Markdown Code: <br>`[![Years Badge](https://badges.pufler.dev/repos/puf17640)](https://badges.pufler.dev)`
  
- [![Visits Badge](https://badges.pufler.dev/visits/puf17640/puf17640?style=flat-square&color=black&logo=github&label=visits)](https://badges.pufler.dev) <br>
  `https://badges.pufler.dev/visits/puf17640/puf17640?style=flat-square&color=black&logo=github&label=visits`
  
  Returns a badge with customisations with [shields.io styles](https://shields.io/#styles) via query parameters.
  
- Got an idea for a badge? 

  Create an [issue](https://github.com/puf17640/git-badges/issues/new) and I will reply soon!

## Installation:
```
git clone https://github.com/puf17640/git-badges

cd git-badges

npm install

# Rename .env.example to .env

# Run MongoDB as a Docker container 
docker run -d --rm -p 27017:27017 mongo

npm run start
```

The app should now be started on http://localhost:3000.