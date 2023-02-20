#!/usr/bin/env sh

echo "This is a custom script to be invoked directly that wraps launching a Storybook dev server"
echo "Additional args received: $@"

echo "pwd: \c"
pwd

echo "Environment variables:"
env

echo "Invoking npm script..."

npm run storybook
