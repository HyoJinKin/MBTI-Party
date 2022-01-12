from flask import Flask, render_template, jsonify, request, redirect, flash, url_for
from pymongo import MongoClient
import random  # 테스트용 id random 생성
import jwt
import datetime
import hashlib
import init_mbti_db

SECRET_KEY = 'MBTI'

app = Flask(__name__)
app.secret_key = "mf";
client = MongoClient('localhost', 27017)
db = client.dbmbti
collist = db.list_collection_names()
if not ("users" in collist):
    db.create_collection("users")
if not ("parties" in collist):
    db.create_collection("parties")
if not ("mbti" in collist):
    db.create_collection("mbti")
    db.mbti.insert_many(init_mbti_db.mbti_docs)


@app.route('/')
def index():
    token_recieve = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_recieve, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({'id': payload['id']})
        return render_template('index.html', name=user_info["name"])
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))


@app.route('/api/party_list', methods=['GET'])
def show_all():
    parties = list(db.parties.find({}, {'_id': False}))
    return jsonify({'parties': parties})


@app.route('/detail')
def detail():
    id = int(request.args.get("id"))
    detail = db.parties.find_one({'id': id})
    title = detail['title']
    desc = detail['description']
    favorite_mbti = detail['favorite_mbti']

    max_member_num = detail['max_member_num']
    master_id = detail['master_id']
    member_ids = detail['member_ids']
    member_mbtis = detail['member_mbtis']
    return render_template(
        'detail.html',
        id=id, title=title, desc=desc, favorite_mbti=favorite_mbti,
        max_member_num=max_member_num,
        master_id=master_id, member_ids=member_ids, member_mbtis=member_mbtis
    )


@app.route('/api/join_party')
def join_party():
    party_id = request.form['party_id_request']
    user_id = request.form['user_id_request']
    user_mbti = request.form['mbti_request']

    member_ids_query = db.parties.find({"id": party_id})['members_ids']
    if member_ids_query == "":
        member_ids_query.append(user_id)
    else:
        member_ids_query.append("," + user_id)

    member_mbtis_query = db.parties.find_one({"id": party_id})['member_mbtis']
    if member_mbtis_query == "":
        member_mbtis_query.append(user_id + "," + user_mbti)
    else:
        member_mbtis_query.append(";" + user_id + "," + user_mbti)

    db.parties.find_one_and_update(
        {"id": party_id},
        {"$set": {"member_ids": member_ids_query, "member_mbtis": member_mbtis_query}}
    )


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
    # hash 기능으로 pw를 암호화한다.
    pw_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()

    # img = userinfo_receive['img']
    MBTI = request.form['MBTI_give']
    doc = {
        'name': name,
        'regisNum': regisNum,
        'id': id,
        'password': pw_hash,
        # 'img': img,
        'MBTI': MBTI
    }
    db.users.insert_one(doc)

    return jsonify({'msg': '회원가입이 완료되었습니다.'})


@app.route('/login')
def login():
    return render_template('login.html')


@app.route('/api/login', methods=['POST'])
def api_login():
    id_receive = request.form['id_give']
    pw_receive = request.form['pw_give']

    # hash 기능으로 pw를 암호화한다.
    pw_hash = hashlib.sha256(pw_receive.encode('utf-8')).hexdigest()

    # id, 암호화된 pw 가지고 있는 유저 찾기.
    result = db.users.find_one({'id': id_receive, 'password': pw_hash})
    # 찾으면 JWT 토큰 발급.
    if result is not None:
        payload = {
            'id': id_receive,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=30)
        }

        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

        # 만든 토큰을 준다.
        return jsonify({'result': 'success', 'token': token})
    else:
        return jsonify({'msg': '아이디 / 비밀번호가 일치하지 않습니다.'})


def get_token(tokenName):
    token_receive = request.cookies.get(tokenName)
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        return payload
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return False


@app.route('/information_check')
def information_check():
    return render_template('information_check.html')


@app.route('/information_check', methods=['POST'])
def id_check():
    name_receive = request.form['name_give']
    regisNum_receive = request.form['regisNum_give']

    result = db.users.find_one({'name': name_receive, 'regisNum': regisNum_receive})
    if result is not None:
        email = list(db.users.find({'name': name_receive, 'regisNum' : regisNum_receive}, {'password':False,'_id':False,'MBTI':False}))
        return jsonify({'result': 'success', 'email': email})
    else:
        return jsonify({'result': 'fail', 'msg': '입력하신 정보의 아이디가 존재하지 않습니다.'})


@app.route('/build_party')
def build_party():
    user_id = get_token('mytoken')
    if user_id is not False:
        user_mbti = db.users.find_one({'id': user_id['id']}, {'_id': False})['MBTI']
        return render_template('build_party.html', user_mbti=user_mbti)
    else:
        flash("로그인이 필요합니다!")
        return redirect('/login')

@app.route('/build_party', methods=['POST'])
def reg_party():
    purpose_receive = request.form['purpose_give']
    mbti_receive = request.form['mbti_give']
    title_receive = request.form['title_give']
    description_receive = request.form['description_give']
    max_member_num_receive = request.form['max_member_num_give']
    user_id = get_token('mytoken')
    party_id = len(list(db.parties.find({}))) + 1

    if user_id is not False:
        doc = {
            'id': party_id,
            'master_id': user_id['id'],
            'member_ids': user_id['id'],
            'member_mbtis': db.users.find_one({'id': user_id['id']}, {'_id': False})['MBTI']+","+user_id['id'],
            'purpose': purpose_receive,
            'favorite_mbti': mbti_receive,
            'title': title_receive,
            'description': description_receive,
            'max_member_num': max_member_num_receive
        }
        db.parties.insert_one(doc)
        return jsonify({'msg': '생성 완료!!'})
    else:
        return jsonify({'msg': '다시 로그인 해주세요!'})



if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
