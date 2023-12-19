package main

import (
	"fmt"
	"net/http"
	"os"
	"time"
	"pixelpower/videoservice"
	"github.com/arsmn/fiber-swagger/example/docs"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"github.com/rs/zerolog"
	_ "github.com/rs/zerolog/log"
	"github.com/shirou/gopsutil/cpu"
	"github.com/shirou/gopsutil/load"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

var (
	db     *gorm.DB
	router *gin.Engine
	log    zerolog.Logger
)

func main() {
	// Initialize Dependencies
	// Service Port, Database, Logger, Cache, Message Queue etc.
	router := gin.Default()
	router.Use(CORSMiddleware())
	// dsn := "postgres://" + os.Getenv("DB_USER") + ":" + os.Getenv("DB_PASSWORD") + "@" + os.Getenv("DB_SERVER") + ":" + os.Getenv("DB_PORT") + "/" + os.Getenv("DB_DATABASE")
	// // log.Info().Msg(dsn)
	// db, err := gorm.Open("postgres", dsn)
	// if err != nil {
	// 	log.Error().Err(err).Msg("")
	// }
	// defer db.Close()
	// // db.LogMode(true)
	// db.SingularTable(true)
	// db.DB().SetMaxIdleConns(10)
	// Swagger info
	docs.SwaggerInfo.Title = "Pixel Power"
	docs.SwaggerInfo.Description = "List of APIs for PixelPower project"
	docs.SwaggerInfo.Version = "1.0"
	docs.SwaggerInfo.Host = ""
	docs.SwaggerInfo.BasePath = "/"
	docs.SwaggerInfo.Schemes = []string{"https", "http"}

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// // Boostrap services
	// competitionSvc := &competition.HandlerService{}
	// competitionSvc.Bootstrap(router)

	marathonSvc := &videoservice.HandlerService{}
	marathonSvc.Bootstrap(router)

	// Start the service
	router.GET("/health", healthsvc)
	port := os.Getenv("SERVICE_PORT")
	log.Info().Msg("Starting server on :" + port)
	router.Run(":" + port)
}

func healthsvc(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": health()})
}

func health() string {
	percent, _ := cpu.Percent(time.Second, true)
	load, _ := load.Avg()
	return fmt.Sprintf("CPU: %v\n Load: %v\n", percent, load)
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3006")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

		//fmt.Println(c.Request.Method)

		if c.Request.Method == "OPTIONS" {
			fmt.Println("OPTIONS")
			c.AbortWithStatus(200)
		} else {
			c.Next()
		}
	}
}
