package videoservice

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	"time"

	// "os"

	"cloud.google.com/go/storage"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

const IMAGES = "https://content.weyyak.com/"

type HandlerService struct{}

// All the services should be protected by auth token
func (hs *HandlerService) Bootstrap(r *gin.Engine) {
	r.POST("/upload", hs.UploadVideo1)
	r.GET("/videos/:folderName", hs.GetAllGcpVideo2)
	r.GET("/convertedvideos", hs.GetAllTranscriptionVideo)
	r.GET("/video/:objectName", hs.GetGcpVideo)
	r.GET("/lang/video/:objectName", hs.GetGcpVideoLang)

}

func (hs *HandlerService) UploadVideo(c *gin.Context) {
	file, header, err := c.Request.FormFile("video")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	defer file.Close()

	ctx := context.Background()
	client, gcperr := getGCPClient()
	if gcperr != nil {
		fmt.Println("from gcp Connection", gcperr)
		// return gcperr
	}
	defer client.Close()

	bucketName := "ixelpower"
	objectName := header.Filename

	wc := client.Bucket(bucketName).Object(objectName).NewWriter(ctx)
	if _, err = io.Copy(wc, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if err := wc.Close(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Video uploaded successfully"})
}

func (hs *HandlerService) GetAllGcpVideo(c *gin.Context) {
	ctx := context.Background()
	client, gcperr := getGCPClient()
	if gcperr != nil {
		fmt.Println("from gcp Connection", gcperr)
		// return gcperr
	}
	defer client.Close()

	bucketName := "pixelpower"
	folderName := c.Param("folderName")

	query := &storage.Query{Prefix: folderName + "/"}

	var videos []string

	it := client.Bucket(bucketName).Objects(ctx, query)
	for {
		attrs, err := it.Next()
		if err == iterator.Done { // Fix here
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		videos = append(videos, attrs.Name)
	}

	c.JSON(http.StatusOK, gin.H{"videos": videos})
}

func (hs *HandlerService) GetGcpVideo(c *gin.Context) {
	ctx := context.Background()
	// Set up the GCP Cloud Storage client
	client, gcperr := getGCPClient()
	if gcperr != nil {
		fmt.Println("from gcp Connection", gcperr)
		// return gcperr
	}
	defer client.Close()

	bucketName := "encode_project_pixelpower"
	folderName := c.Query("videoType")
	objectName := folderName + "/" + c.Param("objectName")
	videoType := c.Query("videoType")

	if videoType == "" {
		folderName = "Input_Video_Folder"
	}
	fmt.Println("objectName", objectName)
	obj := client.Bucket(bucketName).Object(objectName)

	attrs, err := obj.Attrs(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	filenameInBucket := strings.Split(attrs.Name, "/")
	// Create the desired JSON response
	response := gin.H{
		"fileName":     filenameInBucket[len(filenameInBucket)-1],
		"modifiedTime": attrs.Updated,
		"uploadTime":   attrs.Created,
		"url":          fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, objectName),
	}
	fmt.Println("responseresponse" , response)
	apiURL := os.Getenv("AI_URL")
	requestData := RequestBody{
		VideoURL:            fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, objectName),
		TranslationLanguage: "ta",
	}
	_ = response
	responsea, err := MakePOSTRequest(apiURL, requestData)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	c.JSON(http.StatusOK, responsea)
}

func getGCPClient() (*storage.Client, error) {

	data := map[string]interface{}{
		"type":                        "service_account",
		"project_id":                  "engro-poc",
		"private_key_id":              "4a8e1e3b1599c90e9eab99e9c2041a7a036e4aa1",
		"private_key":                 "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC8J1Al9mm04lJD\n0NSLdGLVRrobF8TB4McGEfEw6Q356+ayInmcV3xkX29GIuZbMoP4dAF5n4UHeN/f\nD65e3d941KvRj5ydhmtoAN2RUkA5GTmLVPLFm51CKn/6RJHwv1ikGKwk3OisLaAi\ntD1FcJYPHivGprGg4+jCRxpnn2vOipq9vBGDPdzCr0pIySmeSj2o4TMmj+t9sTcE\nuJgR1PjjnycCAdnCV/UjvF2dHIEaw4/YFMyyWFzuJsHXjd/04DbGFDgD7g0Atd5i\n+/nz5SujHN9KKVVs23mqkmNNAkvr8L1wEIOdoXAGDyS9n39EVJpP3Z5RE7yXHnUb\nUN1tdFuDAgMBAAECggEARM6BpmhfDsmnOOqhF6CH1iPnwimmiBop3kPodrD7rfZB\nZsppu61YraIi4Ly5jgdCsLTHp1EZRnrDL+EdrM6pvxfS/69roEW8eIu8ezzfhKH/\nY788itxWHZDKPV0fG7H1+giVx2NL6U9EHPzZ3U+HaN7pNlvWYJaIE6gJ9XQc6iov\ng/sMQ3NMiZfxZfhbUyUbb+91auD8BAennXB9Qg2hOdzy3iOtz4S+VGmhX7h1saY4\nnCbohvyKf315No5msXPqHEOERqJuvq6EJeOmZm0EmtTgE5XoQ7OHyPJ76e+dZLtN\ne4CAlnws7/fPIWD9UuV3VGsz6pVFAl79DPfExm27gQKBgQDy8PKebdNze72V4Fgk\nFsI1czpccLrokDiv5P2Q98XayfF0XjDUxdvoFrvTfmukZ2a9kMtgtLHZsCRwqUO6\nXNpTv9Na7ud9yeFS/JGdz7Fra8hp9NZr+8A2EI4BHN0iZEyUyMZGg1HheeXDOXUv\nsoEZKvfwf7OuvONSccQ5KAIhgQKBgQDGRHJT996osd3wRLmUEdetqVF6fL7VD48q\ndzIPpYeTeZILzE9RqBFHkXGCmgWp/9aWrpUx7UkY29XBuhgfU0fS0Y3xAcqNNytV\ni2htxqCIHN3UaRGmKEw3xwFK72SlCCjtstef2UdNAPpi4whMa3cuYm7zHew43D6X\ne1kgj1t3AwKBgQCLB0rBUbadsyXG3LF0TbXsorm2Zyj/qHFYb+KQkMsgr0rHvpOR\nYH29ryzkFsgBOM96Ep/hAud43a2s76D7yOGE5hVNR8UgnmSdej7XIiG1iOQThvMi\nrtrL1eN+TYdbhCyzRMb7WXGFaJ4NgBdJKY1p2sYzUtGAYUZySvrxfqzhgQKBgG8k\ne3p6nsSuQJ2pyOYqQl9FZTlmqItDV5wUiWmf/yo6ohYfB+/caSNXcuwlbztnAWIi\np9v/ClT3FxKsQU1+H+scMZeCy4rx/EbOCVJQYDktBWVHKO+d82vpEN5y6FZjBp6I\n/LrM0F1oSPQaFNLSA1NrNoruoTcWr7e3G7VW540FAoGAbqg135FDc3FOV4lhyMj4\nPIfqnokocWoHlO1ECRSOW+791LFLAu/9oOj7OayUGOVIm2KOj0CDJqvtJ1064//4\nFCPeKEa4J+XlQBgYzIaRPV3ZqJ1DKiXOnC7PmFJGUNQ9353q2gNCSXVZPvtsbf16\ndJEmtz7wFJQCx0mLGC4+0oA=\n-----END PRIVATE KEY-----\n",
		"client_email":                "encode-temp-account@engro-poc.iam.gserviceaccount.com",
		"client_id":                   "111099359460527286236",
		"auth_uri":                    "https://accounts.google.com/o/oauth2/auth",
		"token_uri":                   "https://oauth2.googleapis.com/token",
		"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
		"client_x509_cert_url":        "https://www.googleapis.com/robot/v1/metadata/x509/encode-temp-account%40engro-poc.iam.gserviceaccount.com",
		"universe_domain":             "googleapis.com",
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	ctx := context.Background()
	creds, err := google.CredentialsFromJSON(ctx, jsonData, "https://www.googleapis.com/auth/cloud-platform")
	if err != nil {
		fmt.Println("Error creating credentials:", err)
	}
	client, err := storage.NewClient(ctx, option.WithCredentials(creds))

	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return client, err
}

func (hs *HandlerService) GetAllGcpVideo2(c *gin.Context) {
	ctx := context.Background()
	client, gcperr := getGCPClient()
	if gcperr != nil {
		fmt.Println("from gcp Connection", gcperr)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to Google Cloud Storage"})
		return
	}
	defer client.Close()
	videoType := c.Query("videoType")

	bucketName := "encode_project_pixelpower"
	folderName := videoType
	if videoType == "" {
		folderName = c.Param("folderName")
	}

	query := &storage.Query{Prefix: folderName + "/", Delimiter: "/"}

	var videos []map[string]interface{}

	it := client.Bucket(bucketName).Objects(ctx, query)
	for {
		attrs, err := it.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Skip entries that represent folders
		if strings.HasSuffix(attrs.Name, "/") {
			continue
		}
		filenameInBucket := strings.Split(attrs.Name, "/")

		video := map[string]interface{}{
			"url":          generateVideoURL(bucketName, attrs.Name),
			"fileName":     filenameInBucket[len(filenameInBucket)-1],
			"uploadTime":   attrs.Created,
			"modifiedTime": attrs.Updated,
		}

		videos = append(videos, video)
	}

	c.JSON(http.StatusOK, gin.H{"videos": videos})
}

func generateVideoURL(bucketName, objectName string) string {
	// Replace this with your actual GCS bucket URL or use signed URLs if needed
	return fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, objectName)
}

func (hs *HandlerService) UploadVideo1(c *gin.Context) {
	// Get the video type from query parameters
	videoType := c.Query("videoType")

	// Validate video type
	if videoType != "education" && videoType != "entertainment" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid videoType"})
		return
	}

	file, header, err := c.Request.FormFile("video")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	defer file.Close()

	ctx := context.Background()
	client, gcperr := getGCPClient()
	if gcperr != nil {
		fmt.Println("from gcp Connection", gcperr)
		// Handle the error and return a response
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}
	defer client.Close()

	bucketName := "encode_project_pixelpower"
	// Set the object name based on the video type
	objectName := videoType + "/" + header.Filename

	wc := client.Bucket(bucketName).Object(objectName).NewWriter(ctx)
	if _, err = io.Copy(wc, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if err := wc.Close(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get the created time of the uploaded video
	createdTime := time.Now().Format(time.RFC3339)

	// Generate a public URL for the uploaded video
	publicURL := fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, objectName)

	// Extract the video name from the header
	videoName := header.Filename

	// Create the response
	response := gin.H{
		"message":     "Video uploaded successfully",
		"videoName":   videoName,
		"publicURL":   publicURL,
		"createdTime": createdTime,
	}

	c.JSON(http.StatusOK, response)
}

func MakePOSTRequest(url string, requestData RequestBody) (map[string]interface{}, error) {
	// Convert request data to JSON
	jsonData, err := json.Marshal(requestData)
	if err != nil {
		return nil, err
	}

	// Create a buffer with the JSON data
	buffer := bytes.NewBuffer(jsonData)

	// Make the POST request
	response, err := http.Post(url, "application/json", buffer)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	// Read the response body
	responseBody, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	// Convert the JSON response to a map[string]interface{}
	var result map[string]interface{}
	err = json.Unmarshal(responseBody, &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}


func (hs *HandlerService) GetGcpVideoLang(c *gin.Context) {
	ctx := context.Background()
	// Set up the GCP Cloud Storage client
	client, gcperr := getGCPClient()
	if gcperr != nil {
		fmt.Println("from gcp Connection", gcperr)
		// return gcperr
	}
	defer client.Close()

	bucketName := "encode_project_pixelpower"
	folderName := c.Query("videoType")
	objectName := folderName + "/" + c.Param("objectName")
	videoType := c.Query("videoType")
	language := c.Query("lang")

	if videoType == "" {
		folderName = "Input_Video_Folder"
	}
	fmt.Println("objectName", objectName)
	obj := client.Bucket(bucketName).Object(objectName)

	attrs, err := obj.Attrs(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	filenameInBucket := strings.Split(attrs.Name, "/")
	// Create the desired JSON response
	response := gin.H{
		"fileName":     filenameInBucket[len(filenameInBucket)-1],
		"modifiedTime": attrs.Updated,
		"uploadTime":   attrs.Created,
		"url":          fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, objectName),
	}
	apiURL := os.Getenv("AI_URL")
	requestData := RequestBody{
		VideoURL:            fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, objectName),
		TranslationLanguage: language,
	}
	_ = response
	responsea, err := MakePOSTRequest(apiURL, requestData)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	c.JSON(http.StatusOK, responsea)
}

func (hs *HandlerService) GetAllTranscriptionVideo(c *gin.Context) {
	ctx := context.Background()
	client, gcperr := getGCPClient()
	if gcperr != nil {
		fmt.Println("from gcp Connection", gcperr)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to Google Cloud Storage"})
		return
	}
	defer client.Close()
	videoType := c.Query("video")
	bucketName := "encode_project_pixelpower"
	folderName := os.Getenv("VIDEO_OUTPUT_FOLDER")

	languageFolder := []string{"Default", "Hindi", "Telugu", "Tamil"}
	var videos []map[string]interface{}
	for _, lang := range languageFolder {
		// query := &storage.Query{Prefix: folderName + "/" + lang + "/", Delimiter: "/"}
		objectName := folderName + "/" + lang + "/" + videoType
		fmt.Println("objectName" , objectName)
		obj := client.Bucket(bucketName).Object(objectName)

		attrs, err := obj.Attrs(ctx)
		if err != nil {
			continue

		}
		filenameInBucket := strings.Split(attrs.Name, "/")
		// Create the desired JSON response
		video := gin.H{
			"fileName":     filenameInBucket[len(filenameInBucket)-1],
			"modifiedTime": attrs.Updated,
			"uploadTime":   attrs.Created,
			"url":          fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, objectName),
		}
		videos = append(videos, video)
	}
	if videos == nil {
		c.JSON(http.StatusOK, gin.H{"videos": make([]int, 0)})
		return
	}
	c.JSON(http.StatusOK, gin.H{"videos": videos})
}
