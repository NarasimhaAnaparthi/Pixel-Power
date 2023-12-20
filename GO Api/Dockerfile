FROM golang:alpine AS builder

# Set necessary environmet variables needed for our image
ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

# Move to working directory /build
WORKDIR /build

# Copy and download dependency using go mod
COPY go.mod .
COPY go.sum .
RUN go mod download

# Copy the code into the container
COPY . .

# Build the application
RUN go build -o main .

# Move to /dist directory as the place for resulting binary folder
WORKDIR /dist

# Copy binary from build to main folder
RUN cp /build/main .
# RUN cp /build/.env .

# Build a small image
FROM alpine:3.14.0

COPY --from=builder /dist/main /

ENV SERVICE_PORT=3000 \
    AI_URL="http://34.123.104.93:5000/process_video"
    VIDEO_OUTPUT_FOLDER="Output_Video_Folder"
    BUCKET_NAME="encode_project_pixelpower"

EXPOSE ${SERVICE_PORT}

# Command to run
ENTRYPOINT ["/main"]
