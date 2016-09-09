ORG = pickaguidedockercloud
NAME = pickaguide_backendapi
CONTAINER = container_backApi
REPOSITORY = $(ORG)/$(NAME)
SHA1 = $(shell git log -1 --pretty=oneline | cut -c-10)
BRANCH = $(shell git branch -a --contains $(SHA1) | egrep '(remotes/|\*)' | egrep -v "(HEAD|detached)" | head -1 | sed -e "s/\* //" -e "s/.*\///")
VERSION = $(BRANCH)-$(SHA1)
PORT = 3000
EXPOSE = 3000

all: build

build:
	docker build -t $(REPOSITORY) .

push:
	docker push $(REPOSITORY)

clean:
	docker stop $(CONTAINER) && docker rm $(CONTAINER)

run:
	docker run --name $(CONTAINER) -p $(EXPOSE):$(PORT) -d $(REPOSITORY)

start:
	npm install
	npm start

test-api:
	npm install
	npm test
