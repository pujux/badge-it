# Badge-It

[![GitHub stars](https://img.shields.io/github/stars/pujux/badge-it?color=brightgreen)](https://github.com/pujux/badge-it/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/pujux/badge-it?color=brightgreen)](https://github.com/pujux/badge-it/issues)
[![GitHub forks](https://img.shields.io/github/forks/pujux/badge-it?color=brightgreen)](https://github.com/pujux/badge-it/network)
[![GitHub license](https://img.shields.io/github/license/pujux/badge-it?color=brightgreen)](https://github.com/pujux/badge-it/blob/main/LICENSE)
[![Twitter](https://img.shields.io/twitter/url?url=https%3A%2F%2Fgithub.com%2Fpujux%2Fbadge-it)](https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Fpujux%2Fbadge-it)

## Table of Contents

- [Usage](#available-badges-🔥)
- [Ideas](#got-an-idea-for-a-badge?-😀)
- [License](#license)

## Available badges 🔥

All endpoints support the parameters you can also use for [shields.io](https://shields.io) badges, you can check out their style documentation [here](https://shields.io/#styles).

[![Visits Badge](https://badges.pufler.dev/visits/pujux/badge-it)](https://badges.pufler.dev/visits/pujux/badge-it)

Returns a badge containing the visitor counter for your repository

###### Endpoint
`https://badges.pufler.dev/visits/{username}/{repo}`

###### Markdown

`[![Visits Badge](https://badges.pufler.dev/visits/pujux/badge-it)](https://badges.pufler.dev)`

---

[![Visits Badge](https://badges.pufler.dev/years/pujux)](https://badges.pufler.dev/years/pujux)
  
Returns a badge containing the number of years you have been a member

###### Endpoint

`https://badges.pufler.dev/years/{username}`

###### Markdown 

`[![Years Badge](https://badges.pufler.dev/years/pujux)](https://badges.pufler.dev)`

---

[![Repos Badge](https://badges.pufler.dev/repos/pujux)](https://badges.pufler.dev/repos/pujux)
  
Returns a badge containing the number of your public repositories

###### Endpoint

`https://badges.pufler.dev/repos/{username}`

###### Markdown

`[![Repos Badge](https://badges.pufler.dev/repos/pujux)](https://badges.pufler.dev)`

---

[![Gists Badge](https://badges.pufler.dev/gists/pujux)](https://badges.pufler.dev/gists/pujux)
  
Returns a badge containing the number of your public gists

###### Endpoint

`https://badges.pufler.dev/gists/{username}`

###### Markdown

`[![Gists Badge](https://badges.pufler.dev/gists/pujux)](https://badges.pufler.dev)`

---

[![Updated Badge](https://badges.pufler.dev/updated/pujux/badge-it)](https://badges.pufler.dev/updated/pujux/badge-it)
  
Returns a badge that shows when the repository was last updated

###### Endpoint

`https://badges.pufler.dev/updated/{username}/{repo}`

###### Markdown

`[![Updated Badge](https://badges.pufler.dev/updated/pujux/badge-it)](https://badges.pufler.dev)`

---

[![Created Badge](https://badges.pufler.dev/created/pujux/badge-it)](https://badges.pufler.dev/created/pujux/badge-it)
  
Returns a badge that shows when the repository was created

###### Endpoint

`https://badges.pufler.dev/created/{username}/{repo}`

###### Markdown

`[![Created Badge](https://badges.pufler.dev/created/pujux/badge-it)](https://badges.pufler.dev)`

---

[![Commits Badge](https://badges.pufler.dev/commits/monthly/pujux)](https://badges.pufler.dev/commits/monthly/pujux)
  
Returns a badge that shows the number of commits you have published in a specified periodicity (yearly, monthly, weekly, daily or all)

###### Endpoint

`https://badges.pufler.dev/commits/{periodicity}/{username}`

###### Markdown

`[![Commits Badge](https://badges.pufler.dev/commits/monthly/pujux)](https://badges.pufler.dev)`

---

[![Contributors Display](https://badges.pufler.dev/contributors/pujux/badge-it?size=50&padding=5&bots=true)](https://badges.pufler.dev/contributors/pujux/badge-it)
  
Returns an SVG that displays all contributors of the specified repository

You can specify a `size` in pixels that will be used for each avatar, a `padding` in pixels that will be used between the avatars and `bots` as either 'true' or 'false' to hide bot contributors

###### Endpoint

`https://badges.pufler.dev/contributors/{user}/{repo}?size={size}&padding={padding}&bots=true`

###### Markdown

`[![Contributors Display](https://badges.pufler.dev/contributors/pujux/badge-it?size=50&padding=5&bots=true)](https://badges.pufler.dev)`

## Got an idea for a badge? 😀

Create an [issue](https://github.com/pujux/badge-it/issues/new)!

## License 

Badge-It is licensed under the [BSD 3-Clause License](LICENSE).
