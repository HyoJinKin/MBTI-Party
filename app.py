import datetime
import hashlib
from time import localtime, strftime

import jwt
from flask import Flask, render_template, jsonify, request, redirect, flash, url_for
from flask_socketio import send, leave_room, emit, join_room, SocketIO
from pymongo import MongoClient

import init_mbti_db

SECRET_KEY = 'MBTI'

app = Flask(__name__)
app.secret_key = "mf"
socketio = SocketIO(app)
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
        return render_template('index.html', name=user_info["name"], mbti=user_info["MBTI"])
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))


@app.route('/api/party_list', methods=['GET'])
def show_all():
    parties = list(db.parties.find({}, {'_id': False}))
    return jsonify({'parties': parties})


@app.route('/api/sorted_party_list', methods=['GET'])
def show_sorted_list():
    category = request.args.get("cat")
    parties = list(db.parties.find({'purpose': category}, {'_id': False}))
    return jsonify({'parties': parties})


@app.route('/api/allowed_party_list', methods=['GET'])
def show_allowed_list():
    mbti = request.args.get("mbti")
    user_id = get_token('mytoken')['id']

    parties = list(db.parties.find({
        '$or': [
            {'favorite_mbti': {'$regex': mbti}},
            {'master_info': {'$regex': user_id}}
        ]}, {'_id': False}))
    return jsonify({'parties': parties})


@app.route('/detail')
def detail():
    id = int(request.args.get("id"))
    detail = db.parties.find_one({'id': id})
    room_id = detail['chat_room_id']
    title = detail['title']
    desc = detail['description']
    favorite_mbti = detail['favorite_mbti']
    max_member_num = detail['max_member_num']
    master_name = detail['master_info'].split(",")[0]
    master_id = detail['master_info'].split(",")[1]
    member_info = detail['member_info']

    user_id = get_token('mytoken')['id']
    user_name = db.users.find_one({'id': user_id}, {'_id': False})['name']
    user_mbti = db.users.find_one({'id': user_id}, {'_id': False})['MBTI']

    return render_template(
        'detail.html',
        id=id, room_id=room_id, title=title, desc=desc, favorite_mbti=favorite_mbti,
        max_member_num=max_member_num,
        master_name=master_name, master_id=master_id,
        member_info=member_info,
        user_name=user_name, user_id=user_id, user_mbti=user_mbti,
    )


@app.route('/api/join_party', methods=['POST'])
def join_party():
    party_id = int(request.form['party_id_request'])
    user_id = request.form['user_id_request']
    user_name = db.users.find_one({"id": user_id})['name']
    user_mbti = db.users.find_one({"id": user_id})['MBTI']

    member_info = db.parties.find_one({"id": party_id})['member_info']
    if member_info.count(user_id) > 0:
        return jsonify({'msg': '이미 참여하셨습니다'})
    else:
        add_query = ";" + user_mbti + "," + user_name + "," + user_id
        member_info += add_query

        db.parties.find_one_and_update(
            {"id": party_id},
            {"$set": {"member_info": member_info}}
        )
        return jsonify({'msg': '참여 완료'})


@app.route('/register')
def register():
    return render_template('register.html')


@app.route('/register/checkid', methods=['POST'])
def check_dup():
    # 넘겨받은 아이디를 변수에 담아준다
    id_receive = request.form['id_give']

    # DB에 존재하는디 찾아본다
    exists = bool(db.users.find_one({"id": id_receive}))
    return jsonify({'result': 'success', 'exists': exists})


@app.route('/register', methods=['POST'])
def registerUser():
    # 넘겨받은 정보들을 변수에 담아준다
    name = request.form['name_give']
    id = request.form['id_give']
    regisNum = request.form['regisNum_give']
    password = request.form['password_give']
    # hash 기능으로 pw를 암호화한다.
    pw_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
    MBTI = request.form['MBTI_give']

    # 정보들을 딕셔너리로 만든다
    doc = {
        'name': name,
        'regisNum': regisNum,
        'id': id,
        'password': pw_hash,
        'MBTI': MBTI
    }
    # DB에 넣어준다
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
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=100)
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

    # mongodb에서 유저정보를 찾는다.
    result = db.users.find_one({'name': name_receive, 'regisNum': regisNum_receive})
    if result is not None:
        # 유저정보가 있을 시 (이름과 주민등록번호와 아이디(이메일))을 찾아서 보내준다.
        email = list(db.users.find({'name': name_receive, 'regisNum': regisNum_receive},
                                   {'password': False, '_id': False, 'MBTI': False}))
        return jsonify({'result': 'success', 'email': email})
    else:
        return jsonify({'result': 'fail', 'msg': '입력하신 정보의 아이디가 존재하지 않습니다.'})


@app.route('/password_find')
def password_find():
    return render_template('password_find.html')


@app.route('/password_find', methods=['POST'])
def password_find_change():
    name_receive = request.form['name_give']
    regisNum_receive = request.form['regisNum_give']
    id_receive = request.form['id_give']
    pw_receive = request.form['pw_give']
    pw_ck_receive = request.form['pw_check_give']
    # 비밀번호와 비밀번호 확인이 같지 않을 시 에러메세지를 띄운다.
    if (pw_receive != pw_ck_receive):
        return jsonify({'result': 'fault', 'msg': '비밀번호가 같지 않습니다.'})
    result = list(db.users.find({'name': name_receive, 'regisNum': regisNum_receive, 'id': id_receive}, {'_id': False}))
    if result is not None:
        print(result)
        pw_hash = hashlib.sha256(pw_receive.encode('utf-8')).hexdigest()
        print(pw_hash)
        db.users.update_one({'name': name_receive, 'regisNum': regisNum_receive, 'id': id_receive},
                            {'$set': {'password': pw_hash}})
        return jsonify({'result': 'success', 'msg': '회원정보가 확인되어 비밀번호가 변경되었습니다.'})
    else:
        return jsonify({'result': 'fail', 'msg': '입력정보가 일치하지 않습니다.'})


@app.route('/build_party')
def build_party():
    user_id = get_token('mytoken')

    if user_id is not False:
        user_name = db.users.find_one({'id': user_id['id']}, {'_id': False})['name']
        user_mbti = db.users.find_one({'id': user_id['id']}, {'_id': False})['MBTI']
        return render_template('build_party.html', user_mbti=user_mbti, user_name=user_name)
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
    chat_room_id = "room" + str(party_id)

    if user_id is not False:
        doc = {
            'id': party_id,
            'chat_room_id': chat_room_id,
            'master_name': db.users.find_one({'id': user_id['id']}, {'_id': False})['name'],
            'master_info': ",".join([
                db.users.find_one({'id': user_id['id']}, {'_id': False})['name'],
                user_id['id']
            ]),
            'member_info': ",".join([
                db.users.find_one({'id': user_id['id']}, {'_id': False})['MBTI'],
                db.users.find_one({'id': user_id['id']}, {'_id': False})['name'],
                user_id['id']
            ]),
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


# ROOMS = ["전체방", "방1", "방2", "방3"]


@app.route('/chat')
def chat():
    room_id = request.args.get('room_id')
    user_token = get_token('mytoken')
    if user_token is not False:
        user_id = user_token['id']
    else:
        flash("로그인이 필요합니다!")
        return redirect('/login')
    return render_template('chat.html', user_id=user_id, room=room_id)


@socketio.on('message')
def message(data):
    print('room(message): ' + str(data))
    send({'msg': data['msg'], 'user_id': data['user_id'],
          'time_stamp': strftime('%I:%M%p', localtime())}, broadcast=True, room=data['room'])


@socketio.on('join')
def join(data):
    print('room(join): ' + str(data))
    join_room(data['room'])
    send({'msg': data['user_id'] + "님이" + data['room'] + "방에 입장했습니다!"}, room=data['room'])


@socketio.on('leave')
def leave(data):
    print('room(leave): ' + str(data))
    leave_room(data['room'])
    send({'msg': data['user_id'] + "님이" + data['room'] + "방에서 나갔습니다..."}, room=data['room'])


if __name__ == '__main__':
    # app.run('0.0.0.0', port=5001, debug=True)
    socketio.run(app, host='0.0.0.0', port='5001', debug=True)
