from flask import Flask, render_template, jsonify, request, url_for
from pymongo import MongoClient
import random  # 테스트용 id random 생성

app = Flask(__name__)
client = MongoClient('localhost', 27017)
db = client.dbmbti
collist = db.list_collection_names()
if not ("users" in collist):
    db.create_collection("users")
if not ("parties" in collist):
    db.create_collection("parties")
if not ("mbti" in collist):
    db.create_collection("mbti")

import jwt

import datetime

import hashlib

SECRET_KEY = 'MBTI'

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/party_list', methods=['GET'])
def show_all():
    test_doc = {
        "id": random.choice(range(1, 10000)),
        "name": "테스트",
        "description": "테스트로 넣어본 데이터입니다",
        "max_member_num": 5,
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


@app.route('/register/checkid', methods=['POST'])
def check_dup():
    id_receive = request.form['id_give']
    exists = bool(db.users.find_one({"id": id_receive}))
    return jsonify({'result': 'success', 'exists': exists})




@app.route('/register', methods=['POST'])
def registerUser():
    name = request.form['name_give']
    regisNum = request.form['regisNum_give']
    id = request.form['id_give']
    password = request.form['password_give']
    # img = userinfo_receive['img']
    MBTI = request.form['MBTI_give']
    doc = {
        'name': name,
        'regisNum': regisNum,
        'id': id,
        'password': password,
        # 'img': img,
        'MBTI': MBTI
    }
    db.users.insert_one(doc)

    return jsonify({'msg': '회원가입이 완료되었습니다.'})


@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/api/login', method=['POST'])
def api_login():
    id_receive = request.form['id_give']
    pw_receive = request.form['pw_give']

    # hash 기능으로 pw를 암호화한다.
    pw_hash = hashlib.sha256(pw_receive.encode('utf-8')).hexdigest()

    # id, 암호화된 pw 가지고 있는 유저 찾기.
    result = db.users.find_one({'id':id_receive, 'pw':pw_hash})
    # 찾으면 JWT 토큰 발급.
    if result is not None:
        payload = {
            'id': id_receive,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }

        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256').decode('utf-8')

        # 만든 토큰을 준다.
        return jsonify({'result':'success', 'token':token})
    else:
        return jsonify({'result': 'fail', 'msg':'아이디 / 비밀번호가 일치하지 않습니다.'})



@app.route('/build_party')
def build_party():
    return render_template('build_party.html')

@app.route('/build_party', methods=['POST'])
def reg_party():
    purpose_receive = request.form['purpose_give']
    mbti_receive = request.form['mbti_give']
    title_receive = request.form['title_give']
    description_receive = request.form['description_give']
    max_member_num_receive = request.form['max_member_num_give']
    #임시
    user_id = "zzzsd"

    doc = {
        'id': user_id,
        'purpose': purpose_receive,
        'mbti': mbti_receive,
        'title': title_receive,
        'description': description_receive,
        'max_member_num': max_member_num_receive
    }

    db.parties.insert_one(doc)
    return jsonify({'msg': '생성 완료!!'})

if __name__ == '__main__':
    app.run('0.0.0.0', port=5001, debug=True)
