from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_community.llms.ollama import Ollama
from langchain_community.vectorstores import Chroma
from langchain.prompts import ChatPromptTemplate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson import ObjectId
from datetime import timedelta, datetime
import warnings
import jwt as pyjwt
import logging
from flask_mail import Mail, Message
from get_embedding_function import get_embedding_function

warnings.filterwarnings("ignore")
CHROMA_PATH = "chroma"

PROMPT_TEMPLATE = """
You are a medical professional. Answer the question based only on the following context like a human would. It should consist of paragraph and conversational aspect rather than just a summary. Answer the asked question briefly. Answer in a professional tone:

{context}

---

Answer the question based on the above context: {question}
"""


app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)



# Configure the JWT
app.config['JWT_SECRET_KEY'] = 'MedicalChatbotProjectKMIT'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)


# Configure MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['medical-chatbot']
db2 = client['conversations']
users_collection = db['users']
sessions_collection = db2['sessions']


# Configure Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'medicalchatbot0@gmail.com'  # replace with your email
app.config['MAIL_PASSWORD'] = 'gnna ifjq ycje obvz'  # replace with your email password
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True

mail = Mail(app)

def query_rag(query_text: str):
    try:
        # Prepare the DB.
        embedding_function = get_embedding_function()
        db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

        # Search the DB.
        results = db.similarity_search_with_score(query_text, k=5)

        context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
        prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
        prompt = prompt_template.format(context=context_text, question=query_text)
        print(prompt)
        model = Ollama(model="llama3")
        response_text = model.invoke(prompt)

        sources = [doc.metadata.get("id", None) for doc, _score in results]
        formatted_response = f"{response_text}\n\n\nSources: {sources}"
        print(formatted_response)
        return formatted_response
    except Exception as e:
        print(f"Error in query_rag: {e}")
        return f"Error processing request: {e}"

def query_finetune(prompt: str):
    try:
        gatePrompt = f"<|start_header_id|>system<|end_header_id|>I will now give you a question. This question should only be related to medical queries or advice. If it is related to medical queries or advice, then reply with 'True' and nothing else, no explanation, nothing, just 'True'. If it's not related to medical info, then just say 'False' and nothing else, no explanation, nothing, just 'False'. Just reply with either True or False and nothing else.<|eot_id|><|start_header_id|>user<|end_header_id|> This is the question: {prompt}<|eot_id|>"
        gatedModel = Ollama(model="llama3")
        gateResult = gatedModel.invoke(gatePrompt)
        if gateResult=="False":
            return "This query is not related to medical field. Please ask related queries."
        prompt = f"<|start_header_id|>system<|end_header_id|> Answer the question truthfully, you are a medical professional. If the question is not related to health or gibberish, reply that you are a medical professional and cannot answer it.<|eot_id|><|start_header_id|>user<|end_header_id|> This is the question: {prompt}<|eot_id|>"
        model = Ollama(model="medical-llama")
        response_text = model.invoke(prompt)
        print(response_text)
        return response_text
    except Exception as e:
        print(f"Error in query_rag: {e}")
        return f"Error processing request: {e}"

@app.route('/queryRAG', methods=['POST'])
def queryRAG():
    try:
        data = request.get_json()
        query_text = data.get('query_text')
        if not query_text:
            return jsonify({"error": "No query_text provided"}), 400
        
        print(f"Received query: {query_text}")
        response_text = query_rag(query_text)
        return jsonify({"response": response_text})
    except Exception as e:
        print(f"Error in /query endpoint: {e}")
        return jsonify({"error": f"Error processing request: {e}"}), 500
    

@app.route('/queryFineTune', methods=['POST'])
def queryFinetune():
    try:
        data = request.get_json()
        query_text = data.get('query_text')
        if not query_text:
            return jsonify({"error": "No query_text provided"}), 400
        
        print(f"Received query: {query_text}")
        response_text = query_finetune(query_text)
        return jsonify({"response": response_text})
    except Exception as e:
        print(f"Error in /query endpoint: {e}")
        return jsonify({"error": f"Error processing request: {e}"}), 500

@app.route('/userregister', methods=['POST'])
def user_register():
    data = request.get_json()
    user = data.get('user')

    if not user:
        return jsonify({"message": "No user data provided"}), 400

    name = user.get('name')
    email = user.get('email')
    password = user.get('password')

    if not (name and email and password):
        return jsonify({"message": "All fields are required"}), 400

    existing_user = users_collection.find_one({"email": email})
    
    if existing_user:
        return jsonify({"message": "User Already Exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    new_user = {
        "name": name,
        "email": email,
        "password": hashed_password
    }

    users_collection.insert_one(new_user)
    
    access_token = create_access_token(identity={"email": email})
    new_user["_id"] = str(new_user["_id"]) 

    return jsonify({"message": "Registered Successfully", "user": new_user, "access_token": access_token}), 201

@app.route('/userlogin', methods=['POST'])
def user_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not (email and password):
        return jsonify({"message": "Email and password are required"}), 400

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"message": "User Not Registered"}), 400

   
    if not bcrypt.check_password_hash(user['password'], password):
        return jsonify({"message": "Invalid Credentials"}), 400

    access_token = create_access_token(identity={"email": email})

    return jsonify({
        "message": "Login Successful",
        "access_token": access_token,
        "name": user['name'],
        "email": user['email']
    }), 200

@app.route('/saveSession', methods=['POST'])
def save_session():
    data = request.json
    email = data.get('email')
    session_name = data.get('sessionName')
    messages = data.get('messages')
    
    if not email or not session_name or not messages:
        return jsonify({"error": "Invalid input"}), 400

    user = sessions_collection.find_one({"email": email})

    if user:
        sessions_collection.update_one(
            {"email": email},
            {"$push": {"sessions": {"sessionName": session_name, "messages": messages}}}
        )
    else:
        sessions_collection.insert_one({
            "email": email,
            "sessions": [{"sessionName": session_name, "messages": messages}]
        })

    return jsonify({"status": "success"})

@app.route('/getSessions', methods=['POST'])
def get_sessions():
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = sessions_collection.find_one({"email": email})
    
    if user:
        return jsonify({"sessions": user.get('sessions', [])}), 200
    
    return jsonify({"sessions": []}), 200

@app.route('/forgotPassword', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"message": "Email is required"}), 400

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"message": "Invalid Email"}), 400

    # Generate token
    secret_key = app.config['JWT_SECRET_KEY']
    token = pyjwt.encode({"user_id": str(user["_id"]), "exp": datetime.utcnow() + timedelta(minutes=30)}, secret_key, algorithm="HS256")

    link = f"http://localhost:3000/user/reset/{user['_id']}/{token}"

    # Email sending
    msg = Message(
        'Password Reset Request',
        sender=app.config['MAIL_USERNAME'],
        recipients=[email]
    )
    msg.html = f'''
    <!doctype html>
    <html lang="en-US">
    <head>
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
        <title>Reset Password Email Template</title>
        <meta name="description" content="Reset Password Email Template.">
        <style type="text/css">
            a:hover {{text-decoration: underline !important;}}
        </style>
    </head>
    <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
        <!--100% body table-->
        <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
            style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
            <tr>
                <td>
                    <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                        align="center" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="height:80px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="height:20px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td>
                                <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                    style="max-width:670px;background:#fff; border-radius:3px; text-align:center; -webkit-box-shadow: 0 6px 18px 0 rgba(0,0,0,0.06); -moz-box-shadow: 0 6px 18px 0 rgba(0,0,0,0.06); box-shadow: 0 6px 18px 0 rgba(0,0,0,0.06);">
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 35px;">
                                            <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have requested to reset your password</h1>
                                            <span
                                                style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                            <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                We cannot simply send you your old password. A unique link to reset your
                                                password has been generated for you. To reset your password, click the
                                                following link and follow the instructions.
                                            </p>
                                            <a href="{link}"
                                                style="background:#20e277;text-decoration:none !important; display:inline-block; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                                Password</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                </table>
                            </td>
                        <tr>
                            <td style="height:20px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="height:80px;">&nbsp;</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <!--/100% body table-->
    </body>
    </html>
    '''

    try:
        mail.send(msg)
        logging.info(f"Password reset email sent to {email}")
        print("Hi! I Sent mail!")
        return jsonify({"message": "Password reset link sent to your email"}), 200
    except Exception as e:
        logging.error(f"Failed to send password reset email to {email}: {str(e)}")
        return jsonify({"message": f"Failed to send password reset email: {str(e)}"}), 400

@app.route('/resetPassword/<string:user_id>/<string:token>', methods=['POST'])
def reset_password(user_id, token):
    data = request.get_json()
    password = data.get('newPassword')

    if not password:
        return jsonify({"message": "Password is required"}), 400

    try:
        secret_key = app.config['JWT_SECRET_KEY']
        decoded_token = pyjwt.decode(token, secret_key, algorithms=["HS256"])
        if decoded_token.get('user_id') != user_id:
            return jsonify({"message": "Invalid token"}), 400
    except pyjwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired"}), 400
    except pyjwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"password": hashed_password}})

    return jsonify({"message": "Password reset successful"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)