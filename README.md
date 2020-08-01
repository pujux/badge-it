# git-badges 🎉

###### Useful badges for your GitHub README

All endpoints support the parameters that you can also use for [shields.io](https://shields.io) badges, you can check out the documentation here [shields.io styles](https://shields.io/#styles).

## Currently available badges 🔥

[![Visits Badge](https://badges.pufler.dev/visits/puf17640/git-badges)](https://badges.pufler.dev/visits/puf17640/git-badges)

Returns a badge containing the page hit counter for your repository

###### Endpoint
`https://badges.pufler.dev/visits/{username}/{repo}`

###### Markdown

`[![Visits Badge](https://badges.pufler.dev/visits/puf17640/git-badges)](https://badges.pufler.dev)`

---

[![Visits Badge](https://badges.pufler.dev/years/puf17640)](https://badges.pufler.dev/years/puf17640)
  
Returns a badge containing the number of years you have been a member

###### Endpoint

`https://badges.pufler.dev/years/{username}`

###### Markdown 

`[![Years Badge](https://badges.pufler.dev/years/puf17640)](https://badges.pufler.dev)`

---

[![Repos Badge](https://badges.pufler.dev/repos/puf17640)](https://badges.pufler.dev/repos/puf17640)
  
Returns a badge containing the number of your public repositories

###### Endpoint

`https://badges.pufler.dev/repos/{username}`

###### Markdown

`[![Repos Badge](https://badges.pufler.dev/repos/puf17640)](https://badges.pufler.dev)`

## Contribute to git-badges 😎
```
git clone https://github.com/puf17640/git-badges

cd git-badges

npm install

# Rename .env.example to .env
# Replace 'github_username' and 'github_token' with your GitHub username and a personal token (no additional permissions required)

# Run MongoDB as a Docker container 
docker run -d --rm -p 27017:27017 mongo

npm run start
```

The app should now be started on http://localhost:3000.

## Got an idea for a badge? 😀

Create an [issue](https://github.com/puf17640/git-badges/issues/new) and I will reply soon!