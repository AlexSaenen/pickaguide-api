ORG = pickaguidedockercloud
NAME = pickaguide-api
CONTAINER = container_mongo
REPOSITORY = $(ORG)/$(NAME)
SHA1 = $(shell git log -1 --pretty=oneline | cut -c-10)
BRANCH = $(shell git branch -a --contains $(SHA1) | egrep '(remotes/|\*)' | egrep -v "(HEAD|detached)" | head -1 | sed -e "s/\* //" -e "s/.*\///")
VERSION = $(BRANCH)-$(SHA1)
PORT = 27017
EXPOSE = 27017

all: build

build:
	docker build -t $(REPOSITORY) .

push:
	docker push $(REPOSITORY)

pull:
	docker pull $(REPOSITORY) || true

clean:
	docker stop $(CONTAINER) && docker rm $(CONTAINER)

run:
	docker run --name $(CONTAINER) \
	-e MONGO_DATABASE=pickaguideDB \
	-p $(EXPOSE):$(PORT) \
	-d $(REPOSITORY)
