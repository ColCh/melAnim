TARGET=dist/mel-anim.compiled.js
MIN=dist/mel-anim.min.js
SRC=dist/mel-anim.dev.js
BUILD=/home/melky/workspace/BuildJS/nodejs/build.js
EXTERNS=externs.js
COMPILER_PATH=/home/melky/workspace/compiler-latest/compiler.jar

COMPILER_FLAGS=--formatting PRETTY_PRINT --summary_detail_level 3 --language_in ECMASCRIPT5_STRICT --warning_level VERBOSE --js $(TARGET) --externs $(EXTERNS) --js_output_file $(MIN)

DATE = $(shell /bin/date '+%d.%m.%Y %H:%M:%S')
TAG = $(shell /usr/bin/git describe --tags --abbrev=0)
BRANCH = $(shell git symbolic-ref HEAD --short)

all: build

min: build
	java -jar $(COMPILER_PATH) $(COMPILER_FLAGS) --compilation_level SIMPLE_OPTIMIZATIONS

adv-min:
	java -jar $(COMPILER_PATH) $(COMPILER_FLAGS) --use_types_for_optimization --output_wrapper '(function() {%output%})();' --compilation_level ADVANCED_OPTIMIZATIONS

build: clean
	#sed -e "s/%version/$(TAG)-$(BRANCH)/" -e "s/%build_date/$(DATE)/" $(SRC) > "$(SRC).tmp"
	#node $(BUILD) "$(SRC).tmp" > $(TARGET)
	#rm -f "$(SRC).tmp"

clean: 
	#rm -f $(TARGET)
