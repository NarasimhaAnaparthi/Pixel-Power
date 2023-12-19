package videoservice

type RequestBody struct {
	VideoURL             string `json:"video_url"`
	TranslationLanguage string `json:"translation_language"`
}