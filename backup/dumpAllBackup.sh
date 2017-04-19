todaysDate=$(date +"%Y-%m-%d")
filename="AudioPile_dumpAll__"$todaysDate".sql"
pg_dumpall -v -h localhost -f ./postgres-backup/$filename

# You don't need Fog in Ruby or some other library to upload to S3 -- shell works perfectly fine
# This is how I upload my new Sol Trader builds (http://soltrader.net)
# Based on a modified script from here: http://tmont.com/blargh/2014/1/uploading-to-s3-in-bash

function putS3
{
  path=$1
  file=$2
  aws_path=$3
  bucket=$BUCKET
  date=$(date +"%a, %d %b %Y %T %z")
  acl="x-amz-acl:public-read"
  content_type='application/x-compressed-tar'
  string="PUT\n\n$content_type\n$date\n$acl\n/$bucket$aws_path$file"
  signature=$(echo -en "${string}" | openssl sha1 -hmac "${S3SECRET}" -binary | base64)

  echo $file
  echo $aws_path
  echo $date

  curl -X PUT -T "$path/$file" \
    -H "Host: $bucket.s3.amazonaws.com" \
    -H "Date: $date" \
    -H "Content-Type: $content_type" \
    -H "$acl" \
    -H "Authorization: AWS ${S3KEY}:$signature" \
    "https://$bucket.s3.amazonaws.com$aws_path$file"
}

S3KEY=$AWS_JAMRECORD_ACCESS_KEY_ID
S3SECRET=$AWS_JAMRECORD_SECRET_ACCESS_KEY # pass these in
BUCKET=$AWS_JAMRECORD_BUCKET
S3_PATH='/backup/'

putS3 ./postgres-backup $filename $S3_PATH

rm ./postgres-backup/$filename
