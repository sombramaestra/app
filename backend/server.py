from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, File, UploadFile, Depends, Header, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import requests
from emergentintegrations.llm.chat import LlmChat, UserMessage

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Storage setup
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "pasioncofrade"
storage_key = None

# JWT Configuration
JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

# Password hashing
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# JWT Token Management
def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=15), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

# Auth Helper
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        from bson import ObjectId
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Storage functions
def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple[bytes, str]:
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# Models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str

class PhotoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    hermandad: Optional[str] = None
    price_digital: float
    price_physical: float

class PhotoResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    hermandad: Optional[str] = None
    price_digital: float
    price_physical: float
    image_url: str
    created_at: str

class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str

class OrderItem(BaseModel):
    photo_id: str
    photo_title: str
    format_type: str
    price: float

class OrderCreate(BaseModel):
    items: List[OrderItem]
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    payment_method: str
    total: float

class OrderResponse(BaseModel):
    id: str
    order_number: str
    items: List[dict]
    customer_name: str
    customer_email: str
    customer_phone: str
    payment_method: str
    total: float
    status: str
    created_at: str

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

# Seed admin
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@pasioncofrade.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc)
        })
        logging.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logging.info("Admin password updated")
    
    # Write credentials to file
    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write("## Admin Account\n")
        f.write(f"- Email: {admin_email}\n")
        f.write(f"- Password: {admin_password}\n")
        f.write(f"- Role: admin\n\n")
        f.write("## Auth Endpoints\n")
        f.write("- POST /api/auth/login\n")
        f.write("- POST /api/auth/register\n")
        f.write("- GET /api/auth/me\n")
        f.write("- POST /api/auth/logout\n")

async def seed_categories():
    default_categories = [
        {"id": str(uuid.uuid4()), "name": "Hermandades", "slug": "hermandades"},
        {"id": str(uuid.uuid4()), "name": "Eventos", "slug": "eventos"},
        {"id": str(uuid.uuid4()), "name": "Pueblos de Sevilla", "slug": "pueblos"},
    ]
    
    for cat in default_categories:
        existing = await db.categories.find_one({"slug": cat["slug"]})
        if not existing:
            await db.categories.insert_one(cat)
            logging.info(f"Category created: {cat['name']}")
    
    logging.info("Categories seeding completed")

# Auth endpoints
@api_router.post("/auth/register", response_model=UserResponse)
async def register(input: RegisterRequest, response: Response):
    email = input.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    from bson import ObjectId
    user_id = str(ObjectId())
    hashed = hash_password(input.password)
    
    await db.users.insert_one({
        "_id": ObjectId(user_id),
        "email": email,
        "password_hash": hashed,
        "name": input.name,
        "role": "user",
        "created_at": datetime.now(timezone.utc)
    })
    
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return UserResponse(id=user_id, email=email, name=input.name, role="user")

@api_router.post("/auth/login", response_model=UserResponse)
async def login(input: LoginRequest, response: Response):
    email = input.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return UserResponse(id=user_id, email=user["email"], name=user["name"], role=user["role"])

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(id=user["_id"], email=user["email"], name=user["name"], role=user["role"])

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}

# Photos endpoints
@api_router.post("/photos", response_model=PhotoResponse)
async def create_photo(
    title: str = File(...),
    description: Optional[str] = File(None),
    category: str = File(...),
    subcategory: Optional[str] = File(None),
    hermandad: Optional[str] = File(None),
    price_digital: float = File(...),
    price_physical: float = File(...),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    photo_id = str(uuid.uuid4())
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    storage_path = f"{APP_NAME}/photos/{uuid.uuid4()}.{ext}"
    
    data = await file.read()
    result = put_object(storage_path, data, file.content_type or "image/jpeg")
    
    photo_doc = {
        "id": photo_id,
        "title": title,
        "description": description,
        "category": category,
        "subcategory": subcategory,
        "hermandad": hermandad,
        "price_digital": price_digital,
        "price_physical": price_physical,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.photos.insert_one(photo_doc)
    
    return PhotoResponse(
        id=photo_id,
        title=title,
        description=description,
        category=category,
        subcategory=subcategory,
        hermandad=hermandad,
        price_digital=price_digital,
        price_physical=price_physical,
        image_url=f"/api/photos/{photo_id}/image",
        created_at=photo_doc["created_at"]
    )

@api_router.get("/photos", response_model=List[PhotoResponse])
async def get_photos(
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    hermandad: Optional[str] = None,
    search: Optional[str] = None
):
    query = {"is_deleted": False}
    if category:
        query["category"] = category
    if subcategory:
        query["subcategory"] = subcategory
    if hermandad:
        query["hermandad"] = hermandad
    if search:
        search_regex = {"$regex": search, "$options": "i"}
        query["$or"] = [
            {"title": search_regex},
            {"description": search_regex},
            {"hermandad": search_regex},
            {"subcategory": search_regex},
        ]
    
    photos = await db.photos.find(query, {"_id": 0}).to_list(1000)
    
    return [
        PhotoResponse(
            id=photo["id"],
            title=photo["title"],
            description=photo.get("description"),
            category=photo["category"],
            subcategory=photo.get("subcategory"),
            hermandad=photo.get("hermandad"),
            price_digital=photo["price_digital"],
            price_physical=photo["price_physical"],
            image_url=f"/api/photos/{photo['id']}/image",
            created_at=photo["created_at"]
        )
        for photo in photos
    ]

@api_router.get("/photos/{photo_id}")
async def get_photo(photo_id: str):
    photo = await db.photos.find_one({"id": photo_id, "is_deleted": False}, {"_id": 0})
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    return PhotoResponse(
        id=photo["id"],
        title=photo["title"],
        description=photo.get("description"),
        category=photo["category"],
        subcategory=photo.get("subcategory"),
        hermandad=photo.get("hermandad"),
        price_digital=photo["price_digital"],
        price_physical=photo["price_physical"],
        image_url=f"/api/photos/{photo['id']}/image",
        created_at=photo["created_at"]
    )

@api_router.get("/photos/{photo_id}/image")
async def get_photo_image(photo_id: str):
    photo = await db.photos.find_one({"id": photo_id, "is_deleted": False})
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    data, content_type = get_object(photo["storage_path"])
    return Response(content=data, media_type=content_type)

@api_router.delete("/photos/{photo_id}")
async def delete_photo(photo_id: str, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.photos.update_one(
        {"id": photo_id, "is_deleted": False},
        {"$set": {"is_deleted": True, "deleted_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    return {"message": "Photo deleted successfully"}

# Categories endpoints
@api_router.get("/categories", response_model=List[CategoryResponse])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return [CategoryResponse(**cat) for cat in categories]

@api_router.post("/categories", response_model=CategoryResponse)
async def create_category(name: str, slug: str, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    cat_id = str(uuid.uuid4())
    category = {"id": cat_id, "name": name, "slug": slug}
    await db.categories.insert_one(category)
    return CategoryResponse(id=cat_id, name=name, slug=slug)

# Orders endpoints
@api_router.post("/orders", response_model=OrderResponse)
async def create_order(input: OrderCreate):
    order_id = str(uuid.uuid4())
    order_number = f"PC{datetime.now().strftime('%Y%m%d')}{order_id[:8].upper()}"
    
    order_doc = {
        "id": order_id,
        "order_number": order_number,
        "items": [item.model_dump() for item in input.items],
        "customer_name": input.customer_name,
        "customer_email": input.customer_email,
        "customer_phone": input.customer_phone,
        "payment_method": input.payment_method,
        "total": input.total,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    
    return OrderResponse(**order_doc)

@api_router.get("/orders", response_model=List[OrderResponse])
async def get_orders(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    return [OrderResponse(**order) for order in orders]

@api_router.delete("/orders/{order_id}")
async def delete_order(order_id: str, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.orders.delete_one({"id": order_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order deleted successfully"}

# Contact endpoint
@api_router.post("/contact")
async def submit_contact(input: ContactRequest):
    contact_doc = {
        "id": str(uuid.uuid4()),
        "name": input.name,
        "email": input.email,
        "phone": input.phone,
        "message": input.message,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contacts.insert_one(contact_doc)
    return {"message": "Contact form submitted successfully"}

# Chatbot endpoint
@api_router.post("/chatbot")
async def chatbot(input: ChatRequest):
    session_id = input.session_id or str(uuid.uuid4())
    
    system_message = """Eres un asistente virtual de PasionCofrade, una empresa de fotografía especializada en Semana Santa y eventos cofrades de Sevilla.

Información sobre tamaños de fotografías:
- Formato Digital: Alta resolución (300dpi), entrega por email en 24-48h
- Formato Físico 10x15cm: Ideal para álbumes pequeños
- Formato Físico 20x30cm: Tamaño estándar para enmarcar
- Formato Físico 30x45cm: Formato grande premium
- Formato Físico 50x70cm: Tamaño extra grande para decoración

Información sobre contratos y servicios:
- Cobertura de eventos cofrades y Semana Santa
- Fotografía profesional de hermandades
- Contratación de servicios personalizados disponibles
- Contacto Gonzalo Lara: Instagram @gonzalo_0702, Email gonzalolaramacias@gmail.com, Teléfono 622 242 137
- Contacto Manuel Gómez: Instagram @_manugfotos, Email manuelgfotos@gmail.com, Teléfono 687 836 768
- Los pagos se realizan mediante Bizum o efectivo

Responde de manera amable, profesional y cercana. Siempre en español."""
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-5")
        
        user_message = UserMessage(text=input.message)
        response = await chat.send_message(user_message)
        
        # Save to database
        await db.chat_messages.insert_one({
            "session_id": session_id,
            "message": input.message,
            "response": response,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"response": response, "session_id": session_id}
    except Exception as e:
        logging.error(f"Chatbot error: {e}")
        raise HTTPException(status_code=500, detail="Error processing chat message")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    
    await seed_admin()
    await seed_categories()
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.photos.create_index("id")
    await db.photos.create_index("category")
    await db.categories.create_index("slug", unique=True)
    await db.orders.create_index("order_number")
    logger.info("Database indexes created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
