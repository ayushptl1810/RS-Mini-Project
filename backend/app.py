from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import jwt
import bcrypt
from functools import wraps
import os
from dotenv import load_dotenv
import sys
import certifi

# ---------------------------
# Load environment variables
# ---------------------------
load_dotenv()
print("Loaded MONGO_URI:", os.getenv("MONGO_URI") is not None)
print("Loaded JWT_SECRET_KEY:", os.getenv("JWT_SECRET_KEY") is not None)

app = Flask(__name__)
CORS(app)

# ---------------------------
# Configuration
# ---------------------------
MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Fail fast if JWT secret missing
if not JWT_SECRET_KEY:
    print("❌ ERROR: JWT_SECRET_KEY not found in environment variables.")
    sys.exit(1)

# ---------------------------
# Validate and connect to MongoDB Atlas
# ---------------------------
if not MONGO_URI:
    print("❌ ERROR: MONGO_URI not found in environment variables.")
    sys.exit(1)

try:
    print("🔗 Connecting to MongoDB Atlas securely...")
    client = MongoClient(MONGO_URI, tls=True, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    client.server_info()  # raises if cannot connect
    db = client["RS_Project"]
    users_collection = db["auth"]
    print("✅ Connected to MongoDB Atlas successfully")
except Exception as e:
    print(f"❌ MongoDB Atlas connection error: {e}")
    sys.exit(1)

# ---------------------------
# JWT Helper functions
# ---------------------------
def generate_token(user_id):
    now = datetime.utcnow()
    payload = {
        "user_id": str(user_id),
        "exp": now + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": now,
    }
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    # jwt.encode returns str in PyJWT v2+
    return token

def verify_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload.get("user_id")
    except jwt.ExpiredSignatureError:
        print("Token expired")
        return None
    except jwt.InvalidTokenError:
        print("Invalid token")
        return None

# ---------------------------
# Utility functions
# ---------------------------
def serialize_user(user):
    if user:
        # convert ObjectId to string
        user["_id"] = str(user["_id"])
        user["id"] = user["_id"]  # add 'id' field same as _id (string)
        return user
    return None

def success_response(data, status_code=200):
    return jsonify({"success": True, "data": data}), status_code

def error_response(message, status_code=400):
    return jsonify({"success": False, "error": message}), status_code

# ---------------------------
# Authentication decorator
# ---------------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header:
            try:
                # Expect "Bearer <token>"
                token = auth_header.split(" ")[1]
            except IndexError:
                return error_response("Invalid token format", 401)
        if not token:
            return error_response("Token is missing", 401)
        user_id = verify_token(token)
        if not user_id:
            return error_response("Token is invalid or expired", 401)
        return f(user_id, *args, **kwargs)
    return decorated

# ---------------------------
# Authentication Endpoints
# ---------------------------
@app.route("/auth/register", methods=["POST"])
def register():
    try:
        data = request.json or {}
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not name or not email or not password:
            return error_response("Name, email, and password are required", 400)

        existing_user = users_collection.find_one({"email": email})
        if existing_user:
            return error_response("User with this email already exists", 400)

        # Hash password and store as utf-8 string
        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        user_doc = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "avatar": None,
            "techStack": [],
            "projects": [],
            "resumeData": None,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }

        result = users_collection.insert_one(user_doc)
        user_id = result.inserted_id
        token = generate_token(user_id)

        user = users_collection.find_one({"_id": user_id})
        user = serialize_user(user)
        user.pop("password", None)

        return success_response({"user": user, "token": token}, 201)
    except Exception as e:
        return error_response(str(e), 500)

@app.route("/auth/login", methods=["POST"])
def login():
    try:
        data = request.json or {}
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return error_response("Email and password are required", 400)

        user = users_collection.find_one({"email": email})
        if not user:
            return error_response("Invalid email or password", 401)

        # stored password is a string; encode to bytes for bcrypt.checkpw
        stored_hash = user.get("password")
        if not stored_hash or not bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8")):
            return error_response("Invalid email or password", 401)

        token = generate_token(user["_id"])
        user = serialize_user(user)
        user.pop("password", None)

        return success_response({"user": user, "token": token}, 200)
    except Exception as e:
        return error_response(str(e), 500)

@app.route("/auth/me", methods=["GET"])
@token_required
def get_current_user(user_id):
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return error_response("User not found", 404)
        user = serialize_user(user)
        user.pop("password", None)
        return success_response({"user": user}, 200)
    except Exception as e:
        return error_response(str(e), 500)

# ---------------------------
# Profile Endpoints
# ---------------------------
@app.route("/users/profile", methods=["GET"])
@token_required
def get_profile(user_id):
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return error_response("User not found", 404)
        user = serialize_user(user)
        user.pop("password", None)
        return success_response({
            "name": user.get("name"),
            "email": user.get("email"),
            "avatar": user.get("avatar"),
            "resumeData": user.get("resumeData"),
            "techStack": user.get("techStack", []),
            "projects": user.get("projects", []),
        }, 200)
    except Exception as e:
        return error_response(str(e), 500)

@app.route("/users/profile", methods=["PUT"])
@token_required
def update_profile(user_id):
    try:
        data = request.json or {}
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return error_response("User not found", 404)

        update_data = {}
        allowed_fields = ["name", "email", "avatar", "resumeData"]
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]

        if not update_data:
            return error_response("No valid fields to update", 400)

        update_data["updatedAt"] = datetime.utcnow()

        if "email" in update_data:
            existing_user = users_collection.find_one({
                "email": update_data["email"],
                "_id": {"$ne": ObjectId(user_id)},
            })
            if existing_user:
                return error_response("Email already in use", 400)

        users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
        return success_response(update_data, 200)
    except Exception as e:
        return error_response(str(e), 500)

@app.route("/users/profile/tech-stack", methods=["PUT"])
@token_required
def update_tech_stack(user_id):
    try:
        data = request.json or {}
        tech_stack = data.get("techStack")
        if tech_stack is None or not isinstance(tech_stack, list):
            return error_response("techStack must be an array", 400)
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"techStack": tech_stack, "updatedAt": datetime.utcnow()}},
        )
        return success_response({"techStack": tech_stack}, 200)
    except Exception as e:
        return error_response(str(e), 500)

@app.route("/users/profile/projects", methods=["PUT"])
@token_required
def update_projects(user_id):
    try:
        data = request.json or {}
        projects = data.get("projects")
        if projects is None or not isinstance(projects, list):
            return error_response("projects must be an array", 400)
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"projects": projects, "updatedAt": datetime.utcnow()}},
        )
        return success_response({"projects": projects}, 200)
    except Exception as e:
        return error_response(str(e), 500)

@app.route("/users/profile/resume", methods=["PUT"])
@token_required
def update_resume(user_id):
    try:
        data = request.json or {}
        resume_data = data.get("resumeData")
        if resume_data is None:
            return error_response("resumeData is required", 400)
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"resumeData": resume_data, "updatedAt": datetime.utcnow()}},
        )
        return success_response({"resumeData": resume_data}, 200)
    except Exception as e:
        return error_response(str(e), 500)

# ... (remaining endpoints unchanged - recommendations/jobs etc)

# ---------------------------
# Health check
# ---------------------------
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "message": "API is running"}), 200

# ---------------------------
# Run Flask app
# ---------------------------
if __name__ == "__main__":
    app.run(debug=True, port=8000)