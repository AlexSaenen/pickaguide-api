# pickaguide-api

## Launch in dev mode

    make dev

Il faut aussi cloner le repository `pickaguide-ops` et aller dans `dev`, ensuite:

    make mongo

Ceci lancera en local l'image docker de la base de données vide

## Launch tests

    make test-api

## Staging

Après que votre branche soit mergée avec `dev` et que vous avez reçu dans slack dans le channel
`#build` la notification d'une build réussie alors l'api sera actif sur (http://82.223.82.41/:3030)

## Production

Après que `dev` soit mergée avec `master` et que vous avez reçu dans slack dans le channel
`#build` la notification d'une build réussie alors l'api sera actif sur (http://82.223.82.41/:3000)

## Routes

### Account

#### `/signup` crée un nouveau compte

**Besoin de:**
- `pseudo`
- `password`
- `passwordConfirmation`
- `email`

**Erreurs:**
- `pseudo` existe déjà
- Profil avec `email` existe déjà ou `email` pas valide
- Manque input ou input corrompu
- `password` ou `pseudo` trop court (0) ou trop long (>50)
- `password` et `passwordConfirmation` pas pareils

#### `/findByPseudo` trouve un compte avec un pseudo

**Retourne:**
Le compte s'il a été crée, sinon une erreur

**Besoin de:**
- `pseudo`

**Retourne:**
Le compte s'il a été trouvé, sinon une erreur mongo
