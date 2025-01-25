#!/bin/bash

# Set the directory to watch
WATCH_DIR="./"

# check for required dependencies
if ! command -v fswatch &> /dev/null; then
    if ! command -v inotifywait &> /dev/null; then
        echo "Error: This script requires either fswatch or inotifywait to be installed."
        exit 1
    fi
fi

# check for notify-send on Linux or osascript on macOS
if [[ $(uname -s) == "Darwin" ]]; then
    if ! command -v osascript &> /dev/null; then
        echo "Error: This script requires the 'osascript' command to be installed on macOS."
        exit 1
    fi
else
    if ! command -v notify-send &> /dev/null; then
        echo "Error: This script requires the 'notify-send' command to be installed on Linux."
        exit 1
    fi
fi


function build () {
  if echo "$1" | grep -qE '\~$'; then
        continue
    fi
    if [[ "$1" == *"dist"* ]] || [[ "$1" == *"node_modules"* ]]; then
        return
    fi
    clear;
    echo "File changed: $1";
    # Run the command when a file changes
    echo -e "\n - Building logger \n" && cd logger && yarn build && cd ..;
    echo -e "\n - Building library \n" && cd library && yarn build && cd ..;
    echo -e "\n - Building microservice \n" && cd microservice && yarn build && cd ..;
    echo -e "\n - Building middlewares \n" && cd middlewares && yarn build && cd ..;
    echo -e "\n - Building api-client \n" && cd api-client && yarn build && cd ..;
    echo -e "\n"
    # Push a notification when the build finishes
      if [[ $(uname -s) == "Darwin" ]]; then
        # macOS
        osascript -e 'display notification "Build finished \n '$1'" with title "Modules Build"'
      else
        # Linux
        notify-send "Build finished \n '$1'" "Modules Build"
      fi
}

clear;
echo -e "\n == WATCHING DIR '$WATCH_DIR' == \n"

# Run the command when a file changes in the watch directory
if [[ $(uname -s) == "Darwin" ]]; then
    # macOS
    fswatch -0 "$WATCH_DIR" | while read -d "" event; do
        file=$(echo "$event" | cut -d' ' -f1)
        build $file
    done
else
    # Linux
    inotifywait -m -r -e modify,create,delete "$WATCH_DIR" | while read event; do
        file=$(echo "$event" | cut -d' ' -f1)
        build $file
    done
fi
