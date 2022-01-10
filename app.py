from flask import Flask, render_template, jsonify

app = Flask(__name__)
# db-setup

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
    app.run('0.0.0.0', port=5000, debug=True)


