import express from "express";
import multer from "multer";
import path from "path";
import fs from 'fs';

const app = express();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store uploaded files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => {
    res.json({
        message: "hello world !!",
        body: {
            name: "John Doe",
            age: 20
        },
        statusCode: 200
    });
});

// New route for image upload
app.post("/upload", upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ imageUrl: imageUrl });
});

// New route to get all image URLs
app.get("/images", (req, res) => {
  const uploadsDir = 'uploads';
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading uploads directory' });
    }

    const imageUrls = files
      .filter(file => ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase()))
      .map(file => `${req.protocol}://${req.get('host')}/uploads/${file}`);

    res.json({ images: imageUrls });
  });
});

app.listen(3000, () => {
    console.log("server is running on port 3000");
});
