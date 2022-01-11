from flask import Flask, render_template, jsonify
from pymongo import MongoClient

app = Flask(__name__)
client = MongoClient('localhost', 27017)
db = client.dbmbti
collist = db.list_collection_names()
if not ("users" in collist):
    db_users = db.create_collection("users")
if not ("parties" in collist):
    db_parties = db.create_collection("parties")
if not ("mbti" in collist):
    db_mbti = db.create_collection("mbti")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/detail')
def detail():
    return render_template('detail.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/build_party')
def build_party():
    return render_template('build_party.html')

if __name__ == '__main__':
    app.run('0.0.0.0', port=5001, debug=True)
