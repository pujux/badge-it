# git-badges

### Useful badges for your GitHub Profile README 🎉

All endpoints support the query parameters that you can also use for [shields.io](https://shields.io) badges.

## Currently available:

- [![Visits Badge](https://badges.pufler.dev/visits/puf17640/git-badges)](https://badges.pufler.dev) <br>
  `https://badges.pufler.dev/visits/{username}/{repo}`
  
  Returns a badge containing the page hit counter for your repository
  
  Markdown Code: <br>`[![Visits Badge](https://badges.pufler.dev/visits/puf17640/git-badges)](https://badges.pufler.dev)`
  
- Got an idea for a badge? 

  Create an [issue](https://github.com/puf17640/git-badges/issues/new) and I will reply soon!

## Installation:
```
npm install

echo 'PORT=8080' >> .env
echo 'MONGO_URL=mongodb://localhost:27017/gh-visitors' >> .env

# Running MongoDB as a Docker container 
docker run -d --rm -p 27017:27017 mongo

npm run start
```

Now you can visit http://localhost:8080/visits/username/repo to view your badge.