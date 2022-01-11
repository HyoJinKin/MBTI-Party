from flask import Flask, render_template, jsonify, request, url_for
from pymongo import MongoClient
import random  # 테스트용 id random 생성

# JWT 패키지 사용 ( 설치한 패키지 이름 : PyJWT )
import jwt

# 데이터 저장소에 password가 알아보지 못하게 암호화해서 저장하기 위해,
# hashlib 모듈을 씀.
import hashlib

# 토큰에 만료시간을 주기위해, datetime 모듈을 씀.
import datetime

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


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/party_list', methods=['GET'])
def show_all():
    test_party_doc = {
        "id": random.choice(range(1, 10000)),
        "name": "테스트",
        "description": "테스트로 넣어본 데이터입니다",
        "max_member_num": 5,
        "favorite_mbti": "INFJ,INTJ,INTP",
        "master_id": "master@aaa.com",
        "member_ids": "",
        "member_roles": "aaa:,bbb,ccc,ddd,eee"
    }
    db.parties.insert_one(test_party_doc)
    parties = list(db.parties.find({}, {'_id': False}))
    return jsonify({'parties': parties})


@app.route('/detail')
def detail():
    id = int(request.args.get("id"))
    detail = db.parties.find_one({'id': id})
    name = detail['name']
    desc = detail['description']
    favorite_mbti = detail['favorite_mbti']

    max_member_num = detail['max_member_num']
    master_id = detail['master_id']
    member_ids = detail['member_ids']
    member_roles = detail['member_roles']
    return render_template(
        'detail.html',
        id=id, name=name, desc=desc, favorite_mbti=favorite_mbti,
        max_member_num=max_member_num,
        master_id=master_id, member_ids=member_ids, member_roles=member_roles
    )

@app.route('/api/join_party')
def join_party():
    party_id = request.form['party_id_request']
    user_id = request.form['user_id_request']
    user_role = request.form['role_request']

    member_ids_query = db.parties.find_one({"id":party_id})['members_ids']
    if member_ids_query == "":
        member_ids_query.append(user_id)
    else:
        member_ids_query.append("," + user_id)

    member_roles_query = db.parties.find_one({"id":party_id})['member_roles']
    if member_roles_query == "":
        member_roles_query.append(user_role)
    else:
        member_roles_query.append("," + user_role)

    db.parties.find_one_and_update(
        {"id": party_id},
        {"$set": {"memberIds": member_ids_query, "memberRoles": member_roles_query}},
    )


@app.route('/register')
def register():
    return render_template('register.html')


@app.route('/register', methods=['GET'])
def userIDcheck():
    id_receive = request.form['id_give']
    checkResult = db.users.find_one({'id':id_receive})['id'].toString()

    return jsonify({'msg': checkResult})
    # if len(checkResult) >0 :
    #     checkResult = False
    # return jsonify({'checkID': checkResult})


@app.route('/register', methods=['POST'])
def registerUser():
    name = request.form['name_give']
    regisNum = request.form['regisNum_give']
    id = request.form['id_give']
    password = request.form['password_give']
    # img = userinfo_receive['img']
    # MBTI = userinfo_receive['MBTI']
    doc = {
        'name': name,
        'regisNum': regisNum,
        'id': id,
        'password': password
        # 'img': img,
        # 'MBTI': MBTI
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

    # pw를 hash를 통해 암호화를 한다.
    pw_hash = hashlib.sha256(pw_receive.encode('utf-8')).hexdigest()

    # id, 암호화된 pw를 가지고 유저를 찾는다.
    result = db.users.find_one({'id': id_receive, 'pw': pw_hash})

    # 찾았을 시, JWT 토큰을 만들어 발급.
    if result is not None:
        # JWT 토큰에는, payload와 시크릿키가 필요.
        # 시크릿키가 있어야 토큰을 디코딩(=풀기) 해서 payload 값을 볼 수 있다.
        # 아래에선 id와 exp를 담았다. 즉, JWT 토큰을 풀면 유저ID 값을 알 수 있다.
        # exp에는 만료시간을 넣어준다. 만료시간이 지나면, 시크릿키로 토큰을 풀 때 만료되었다고 에러가 남.
        payload = {
            'id': id_receive,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256').decode('utf-8')

@app.route('/build_party')
def build_party():
    return render_template('build_party.html')

@app.route('/information_check')
def information_check():
    return render_template('information_check.html')

if __name__ == '__main__':
    app.run('0.0.0.0', port=5001, debug=True)
