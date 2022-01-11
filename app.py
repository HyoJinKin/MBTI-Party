from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
import random # 테스트용 삭제 예정

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

@app.route('/api/party_list', methods=['GET'])
def show_all():
    test_doc = {
        "id": random.choice(range(1, 10000)),
        "name": "테스트",
        "description": "테스트로 넣어본 데이터입니다",
        "favorite_mbti": "INFJ,INTJ,INTP"
    }
    db.parties.insert_one(test_doc)
    parties = list(db.parties.find({}, {'_id': False}))
    return jsonify({'parties': parties})

@app.route('/detail')
def detail():
    id = int(request.args.get("id"))
    detail = db.parties.find_one({'id': id})
    name = detail['name']
    desc = detail['description']
    favorite_mbti = detail['favorite_mbti']
    return render_template('detail.html', id=id, name=name, desc=desc, favorite_mbti=favorite_mbti)

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/build_party')
def build_party():
    return render_template('build_party.html')

@app.route('/information_check')
def information_check():
    return render_template('information_check.html')

if __name__ == '__main__':
    app.run('0.0.0.0', port=5001, debug=True)
