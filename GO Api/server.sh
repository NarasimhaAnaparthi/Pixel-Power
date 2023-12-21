export SERVICE_PORT=3000 \
export AI_URL="http://34.123.104.93:5000/process_video" \
export VIDEO_OUTPUT_FOLDER="Output_Video_Folder" \
export BUCKET_NAME="encode_project_pixelpower" \

go run *.go