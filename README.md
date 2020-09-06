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

---

[![Gists Badge](https://badges.pufler.dev/gists/puf17640)](https://badges.pufler.dev/gists/puf17640)
  
Returns a badge containing the number of your public gists

###### Endpoint

`https://badges.pufler.dev/gists/{username}`

###### Markdown

`[![Gists Badge](https://badges.pufler.dev/gists/puf17640)](https://badges.pufler.dev)`

---

[![Updated Badge](https://badges.pufler.dev/updated/puf17640/git-badges)](https://badges.pufler.dev/updated/puf17640/git-badges)
  
Returns a badge that shows when the repository was last updated

###### Endpoint

`https://badges.pufler.dev/updated/{username}/{repo}`

###### Markdown

`[![Updated Badge](https://badges.pufler.dev/updated/puf17640/git-badges)](https://badges.pufler.dev)`

---

[![Created Badge](https://badges.pufler.dev/created/puf17640/git-badges)](https://badges.pufler.dev/created/puf17640/git-badges)
  
Returns a badge that shows when the repository was created

###### Endpoint

`https://badges.pufler.dev/created/{username}/{repo}`

###### Markdown

`[![Created Badge](https://badges.pufler.dev/created/puf17640/git-badges)](https://badges.pufler.dev)`

---

[![Commits Badge](https://badges.pufler.dev/commits/monthly/puf17640)](https://badges.pufler.dev/commits/monthly/puf17640)
  
Returns a badge that shows the number of commits you have published in a specified periodicity (yearly, monthly, weekly, daily or all)

###### Endpoint

`https://badges.pufler.dev/commits/{periodicity}/{username}`

###### Markdown

`[![Commits Badge](https://badges.pufler.dev/commits/monthly/puf17640)](https://badges.pufler.dev)`

---

[![Contributors Display](https://badges.pufler.dev/contributors/puf17640/git-badges?size=50&padding=5&bots=true)](https://badges.pufler.dev/contributors/puf17640/git-badges)
  
Returns an SVG that displays all contributors of the specified repository

You can specify a `size` in pixels that will be used for each avatar, a `padding` in pixels that will be used between the avatars and `bots` as either 'true' or 'false' to hide bot contributors

###### Endpoint

`https://badges.pufler.dev/contributors/{user}/{repo}?size={size}&padding={padding}&bots=true`

###### Markdown

`[![Commits Badge](https://badges.pufler.dev/contributors/puf17640/git-badges?size=50&padding=5&bots=true)](https://badges.pufler.dev)`

## Self-deployment

If you want to self-deploy `git-badges` using Docker you can just have a look at the example `docker-compose.yml` file inside the repository.

## Got an idea for a badge? 😀

Create an [issue](https://github.com/puf17640/git-badges/issues/new) and I will reply soon!

## Contribute to git-badges 😎

[![Contributors to git badges](https://contributors.thinkverse.vercel.app/api/contributors?org=puf17640&repo=git-badges&bots=false)](https://github.com/puf17640/git-badges/graphs/contributors)


Wanna join us in contributing to git-badges?

```bash
git clone https://github.com/puf17640/git-badges

cd git-badges

npm install

# Rename .env.example to .env
# Replace 'github_username' and 'github_token' with your GitHub username,
# and a personal token (no additional permissions required)

# Run MongoDB as a Docker container 
docker run -d --rm -p 27017:27017 mongo

npm run start
```

Your local version of git-badges should now be running on [localhost:3000](http://localhost:3000).
