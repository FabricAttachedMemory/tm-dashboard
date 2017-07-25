#!/bin/bash

TEST_FILES=`find . -name "*.test"`

set -u

IGNORE="None"

if [ "${1:-}" ]; then
    if [ -z "${2:-}" ];then
        echo "Missing script ignore string!"
        exit 1
    fi
    IGNORE=$2
fi


for test_file in $TEST_FILES
do
    if [[ $test_file == *"$IGNORE"* ]];then
        echo "Ignoring -> $test_file"
    else
        python3 $test_file
    fi
done
