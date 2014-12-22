
LESS_SRC = $(wildcard bootswatch/superhero/*.less)

###
# Build bootstrap css using bootswatch's 'superhero' theme
###

all: $(LESS_SRC)
	@cd bootswatch; grunt swatch:superhero
	cp bootswatch/superhero/bootstrap.min.css css/
	@printf "\nBuilt and updated css\n"

clean:
	rm bootswatch/superhero/bootstrap.min.css
