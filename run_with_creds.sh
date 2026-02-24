#!/bin/bash

# Path to your CSV file
CSV_FILE="$HOME/Downloads/edubridge-dev_accessKeys.csv"

if [ ! -f "$CSV_FILE" ]; then
    echo "Error: Credentials file not found at $CSV_FILE"
    echo "Please download 'edubridge-dev_accessKeys.csv' to your Downloads folder."
    exit 1
fi

# Extract keys and export as environment variables
# Assumes CSV format: Access key ID,Secret access key
echo "Loading credentials from $CSV_FILE..."
export $(cat "$CSV_FILE" | awk -F, 'NR==2 {print "AWS_ACCESS_KEY="$1 " AWS_SECRET_KEY="$2}')

if [ -z "$AWS_ACCESS_KEY" ] || [ -z "$AWS_SECRET_KEY" ]; then
    echo "Error: Could not extract keys from CSV."
    exit 1
fi

export DB_PASSWORD="iKnowTheQuery"

TARGET_PORT=${PORT:-8081}
echo "Checking if port $TARGET_PORT is available..."

if lsof -Pi :$TARGET_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "Warning: Port $TARGET_PORT is currently in use."
    read -p "Do you want to automatically kill the process occupying port $TARGET_PORT? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        echo "Killing processes on port $TARGET_PORT..."
        lsof -ti:$TARGET_PORT | xargs kill -9
        sleep 2
    else
        echo "Exiting so you can manually free the port."
        echo "Linux/macOS command: lsof -ti:$TARGET_PORT | xargs kill -9"
        exit 1
    fi
fi

./mvnw spring-boot:run -Dspring-boot.run.arguments="--debug" -Dspring-boot.run.jvmArguments="-Djava.net.preferIPv4Stack=true -DDB_PASSWORD=$DB_PASSWORD -DAWS_ACCESS_KEY=$AWS_ACCESS_KEY -DAWS_SECRET_KEY=$AWS_SECRET_KEY"
