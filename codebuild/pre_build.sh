#!/bin/bash

rolearn=$(aws sts get-caller-identity | jq -r .Arn | cut -d/ -f1-2 | sed -e 's#assumed-role#role#g')
aws sts assume-role --role-arn $rolearn --role-session-name mysession > session.json
echo "AWS_ACCESS_KEY_ID=$(cat session.json | jq -r .Credentials.AccessKeyId)" > envfile
echo "AWS_SECRET_ACCESS_KEY=$(cat session.json | jq -r .Credentials.SecretAccessKey)" >> envfile
echo "AWS_SESSION_TOKEN=$(cat session.json | jq -r .Credentials.SessionToken)" >> envfile
source envfile

# generate a default profile for SAM with python3
echo "generating the aws cli default profile"
mkdir ~/.aws

cat << EOF > ~/.aws/config
[default]
EOF

# aws configure --profile default set aws_access_key_id ${AWS_ACCESS_KEY_ID}
# aws configure --profile default set aws_secret_access_key ${AWS_SECRET_ACCESS_KEY}
# aws configure --profile default set aws_session_token ${AWS_SESSION_TOKEN}

