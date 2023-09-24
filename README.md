# Sandbox
A sandbox of example games for Milque.js.

## Installing
https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#publishing-a-package

First, make sure you have a valid personal access token on GitHub.
Second, run this:

```
npm login --scope=@milquejs --auth-type=legacy --registry=https://npm.pkg.github.com
```

The username should be your github username. And the password should be the access token.

Finally, temporarily delete `.npmrc` to finish the login and run this:

```
npm install
```
