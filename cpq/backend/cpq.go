package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/handlers"
	_ "github.com/lib/pq"
)

// Product represents a product in the system
type Product struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	CreatedAt   string  `json:"created_at"`
}

// Quote represents a quote in the system
type Quote struct {
	ID              int     `json:"id"`
	CustomerName    string  `json:"customer_name"`
	CustomerEmail   string  `json:"customer_email"`
	CustomerType    string  `json:"customer_type"`
	ProductID       int     `json:"product_id"`
	ProductName     string  `json:"product_name"`
	Quantity        int     `json:"quantity"`
	UnitPrice       float64 `json:"unit_price"`
	DiscountPercent float64 `json:"discount_percent"`
	Subtotal        float64 `json:"subtotal"`
	DiscountAmount  float64 `json:"discount_amount"`
	TaxAmount       float64 `json:"tax_amount"`
	TotalAmount     float64 `json:"total_amount"`
	CreatedAt       string  `json:"created_at"`
}

// CreateQuoteRequest represents the request to create a quote
type CreateQuoteRequest struct {
	CustomerName  string `json:"customer_name"`
	CustomerEmail string `json:"customer_email"`
	CustomerType  string `json:"customer_type"`
	ProductID     int    `json:"product_id"`
	Quantity      int    `json:"quantity"`
}

// Database connection
var db *sql.DB

// Initialize database connection
func initDB() {
	var err error
	// Update these connection parameters according to your PostgreSQL setup
	connStr := "host=localhost port=5432 user=mchinnappan password=postgres dbname=cpq_system sslmode=disable"
	
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	fmt.Println("Successfully connected to PostgreSQL database")
	createTables()
}

// Create necessary tables
func createTables() {
	// Create products table
	productTable := `
	CREATE TABLE IF NOT EXISTS products (
		id SERIAL PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		description TEXT,
		price DECIMAL(10,2) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	// Create quotes table
	quoteTable := `
	CREATE TABLE IF NOT EXISTS quotes (
		id SERIAL PRIMARY KEY,
		customer_name VARCHAR(255) NOT NULL,
		customer_email VARCHAR(255) NOT NULL,
		customer_type VARCHAR(50) NOT NULL,
		product_id INTEGER REFERENCES products(id),
		product_name VARCHAR(255) NOT NULL,
		quantity INTEGER NOT NULL,
		unit_price DECIMAL(10,2) NOT NULL,
		discount_percent DECIMAL(5,2) DEFAULT 0,
		subtotal DECIMAL(10,2) NOT NULL,
		discount_amount DECIMAL(10,2) DEFAULT 0,
		tax_amount DECIMAL(10,2) NOT NULL,
		total_amount DECIMAL(10,2) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	_, err := db.Exec(productTable)
	if err != nil {
		log.Fatal("Failed to create products table:", err)
	}

	_, err = db.Exec(quoteTable)
	if err != nil {
		log.Fatal("Failed to create quotes table:", err)
	}

	// Insert sample products if none exist
	insertSampleData()
}

// Insert sample products
func insertSampleData() {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM products").Scan(&count)
	if err != nil {
		log.Printf("Error checking product count: %v", err)
		return
	}

	if count == 0 {
		sampleProducts := []Product{
			{Name: "Basic Plan", Description: "Perfect for small teams", Price: 29.99},
			{Name: "Professional Plan", Description: "Great for growing businesses", Price: 79.99},
			{Name: "Enterprise Plan", Description: "Full-featured solution", Price: 199.99},
			{Name: "Custom Solution", Description: "Tailored to your needs", Price: 499.99},
		}

		for _, product := range sampleProducts {
			_, err := db.Exec(
				"INSERT INTO products (name, description, price) VALUES ($1, $2, $3)",
				product.Name, product.Description, product.Price,
			)
			if err != nil {
				log.Printf("Error inserting sample product: %v", err)
			}
		}
		fmt.Println("Sample products inserted successfully")
	}
}

// API Handlers

// Get all products
func getProducts(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name, description, price, created_at FROM products ORDER BY id")
	if err != nil {
		http.Error(w, "Failed to fetch products", http.StatusInternalServerError)
		log.Printf("Error fetching products: %v", err)
		return
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var product Product
		var createdAt time.Time
		err := rows.Scan(&product.ID, &product.Name, &product.Description, &product.Price, &createdAt)
		if err != nil {
			http.Error(w, "Failed to scan product", http.StatusInternalServerError)
			log.Printf("Error scanning product: %v", err)
			return
		}
		product.CreatedAt = createdAt.Format("2006-01-02 15:04:05")
		products = append(products, product)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

// Get single product by ID
func getProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid product ID", http.StatusBadRequest)
		return
	}

	var product Product
	var createdAt time.Time
	err = db.QueryRow("SELECT id, name, description, price, created_at FROM products WHERE id = $1", id).
		Scan(&product.ID, &product.Name, &product.Description, &product.Price, &createdAt)
	
	if err == sql.ErrNoRows {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Failed to fetch product", http.StatusInternalServerError)
		log.Printf("Error fetching product: %v", err)
		return
	}

	product.CreatedAt = createdAt.Format("2006-01-02 15:04:05")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

// Create a new product
func createProduct(w http.ResponseWriter, r *http.Request) {
	var product Product
	err := json.NewDecoder(r.Body).Decode(&product)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if product.Name == "" || product.Price <= 0 {
		http.Error(w, "Name and price are required", http.StatusBadRequest)
		return
	}

	var id int
	var createdAt time.Time
	err = db.QueryRow(
		"INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING id, created_at",
		product.Name, product.Description, product.Price,
	).Scan(&id, &createdAt)

	if err != nil {
		http.Error(w, "Failed to create product", http.StatusInternalServerError)
		log.Printf("Error creating product: %v", err)
		return
	}

	product.ID = id
	product.CreatedAt = createdAt.Format("2006-01-02 15:04:05")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(product)
}

// Calculate discount based on customer type and quantity
func calculateDiscount(customerType string, quantity int, unitPrice float64) float64 {
	var discountPercent float64

	switch customerType {
	case "premium":
		discountPercent = 15.0
	case "standard":
		discountPercent = 10.0
	case "basic":
		discountPercent = 5.0
	default:
		discountPercent = 0.0
	}

	// Additional quantity-based discount
	if quantity >= 100 {
		discountPercent += 5.0
	} else if quantity >= 50 {
		discountPercent += 3.0
	} else if quantity >= 10 {
		discountPercent += 2.0
	}

	// Cap discount at 25%
	if discountPercent > 25.0 {
		discountPercent = 25.0
	}

	return discountPercent
}

// Create a new quote
func createQuote(w http.ResponseWriter, r *http.Request) {
	var req CreateQuoteRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.CustomerName == "" || req.CustomerEmail == "" || req.ProductID == 0 || req.Quantity <= 0 {
		http.Error(w, "All fields are required and quantity must be positive", http.StatusBadRequest)
		return
	}

	// Get product details
	var product Product
	err = db.QueryRow("SELECT id, name, price FROM products WHERE id = $1", req.ProductID).
		Scan(&product.ID, &product.Name, &product.Price)
	
	if err == sql.ErrNoRows {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Failed to fetch product", http.StatusInternalServerError)
		log.Printf("Error fetching product: %v", err)
		return
	}

	// Calculate pricing
	unitPrice := product.Price
	subtotal := unitPrice * float64(req.Quantity)
	discountPercent := calculateDiscount(req.CustomerType, req.Quantity, unitPrice)
	discountAmount := subtotal * (discountPercent / 100)
	taxAmount := (subtotal - discountAmount) * 0.08 // 8% tax rate
	totalAmount := subtotal - discountAmount + taxAmount

	// Create quote
	var quote Quote
	var createdAt time.Time
	err = db.QueryRow(`
		INSERT INTO quotes (
			customer_name, customer_email, customer_type, product_id, product_name,
			quantity, unit_price, discount_percent, subtotal, discount_amount,
			tax_amount, total_amount
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id, created_at`,
		req.CustomerName, req.CustomerEmail, req.CustomerType, req.ProductID, product.Name,
		req.Quantity, unitPrice, discountPercent, subtotal, discountAmount,
		taxAmount, totalAmount,
	).Scan(&quote.ID, &createdAt)

	if err != nil {
		http.Error(w, "Failed to create quote", http.StatusInternalServerError)
		log.Printf("Error creating quote: %v", err)
		return
	}

	// Populate quote response
	quote.CustomerName = req.CustomerName
	quote.CustomerEmail = req.CustomerEmail
	quote.CustomerType = req.CustomerType
	quote.ProductID = req.ProductID
	quote.ProductName = product.Name
	quote.Quantity = req.Quantity
	quote.UnitPrice = unitPrice
	quote.DiscountPercent = discountPercent
	quote.Subtotal = subtotal
	quote.DiscountAmount = discountAmount
	quote.TaxAmount = taxAmount
	quote.TotalAmount = totalAmount
	quote.CreatedAt = createdAt.Format("2006-01-02 15:04:05")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(quote)
}

// Get all quotes
func getQuotes(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(`
		SELECT id, customer_name, customer_email, customer_type, product_id, product_name,
			   quantity, unit_price, discount_percent, subtotal, discount_amount,
			   tax_amount, total_amount, created_at 
		FROM quotes ORDER BY created_at DESC`)
	if err != nil {
		http.Error(w, "Failed to fetch quotes", http.StatusInternalServerError)
		log.Printf("Error fetching quotes: %v", err)
		return
	}
	defer rows.Close()

	var quotes []Quote
	for rows.Next() {
		var quote Quote
		var createdAt time.Time
		err := rows.Scan(
			&quote.ID, &quote.CustomerName, &quote.CustomerEmail, &quote.CustomerType,
			&quote.ProductID, &quote.ProductName, &quote.Quantity, &quote.UnitPrice,
			&quote.DiscountPercent, &quote.Subtotal, &quote.DiscountAmount,
			&quote.TaxAmount, &quote.TotalAmount, &createdAt,
		)
		if err != nil {
			http.Error(w, "Failed to scan quote", http.StatusInternalServerError)
			log.Printf("Error scanning quote: %v", err)
			return
		}
		quote.CreatedAt = createdAt.Format("2006-01-02 15:04:05")
		quotes = append(quotes, quote)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(quotes)
}

// Get single quote by ID
func getQuote(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid quote ID", http.StatusBadRequest)
		return
	}

	var quote Quote
	var createdAt time.Time
	err = db.QueryRow(`
		SELECT id, customer_name, customer_email, customer_type, product_id, product_name,
			   quantity, unit_price, discount_percent, subtotal, discount_amount,
			   tax_amount, total_amount, created_at 
		FROM quotes WHERE id = $1`, id).Scan(
		&quote.ID, &quote.CustomerName, &quote.CustomerEmail, &quote.CustomerType,
		&quote.ProductID, &quote.ProductName, &quote.Quantity, &quote.UnitPrice,
		&quote.DiscountPercent, &quote.Subtotal, &quote.DiscountAmount,
		&quote.TaxAmount, &quote.TotalAmount, &createdAt,
	)
	
	if err == sql.ErrNoRows {
		http.Error(w, "Quote not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Failed to fetch quote", http.StatusInternalServerError)
		log.Printf("Error fetching quote: %v", err)
		return
	}

	quote.CreatedAt = createdAt.Format("2006-01-02 15:04:05")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(quote)
}

// Health check endpoint
func healthCheck(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"status":    "healthy",
		"timestamp": time.Now().Format("2006-01-02 15:04:05"),
		"service":   "CPQ System API",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Setup routes
func setupRoutes() *mux.Router {
	r := mux.NewRouter()

	// Health check
	r.HandleFunc("/health", healthCheck).Methods("GET")

	// Product routes
	r.HandleFunc("/api/products", getProducts).Methods("GET")
	r.HandleFunc("/api/products/{id}", getProduct).Methods("GET")
	r.HandleFunc("/api/products", createProduct).Methods("POST")

	// Quote routes
	r.HandleFunc("/api/quotes", getQuotes).Methods("GET")
	r.HandleFunc("/api/quotes/{id}", getQuote).Methods("GET")
	r.HandleFunc("/api/quotes", createQuote).Methods("POST")

	return r
}

func main() {
	// Initialize database
	initDB()
	defer db.Close()

	// Setup routes
	router := setupRoutes()

	// Setup CORS
	corsOptions := handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)

	// Start server
	port := ":8080"
	fmt.Printf("CPQ System API server starting on port %s\n", port)
	fmt.Println("Available endpoints:")
	fmt.Println("  GET    /health                 - Health check")
	fmt.Println("  GET    /api/products           - Get all products")
	fmt.Println("  GET    /api/products/{id}      - Get product by ID")
	fmt.Println("  POST   /api/products           - Create new product")
	fmt.Println("  GET    /api/quotes             - Get all quotes")
	fmt.Println("  GET    /api/quotes/{id}        - Get quote by ID")
	fmt.Println("  POST   /api/quotes             - Create new quote")

	log.Fatal(http.ListenAndServe(port, corsOptions(router)))
}