from flask import Flask, current_app
from db import init_db
from routes import register_routes
from flask_cors import CORS

import logging
def create_app():
    app = Flask(__name__)
    # app.config.from_object('config.Config')
    # init_db(app)
    CORS(app)
    register_routes(app)
    logging.basicConfig(filename='app.log', level=logging.DEBUG)

    return app


app = create_app()



if __name__ == '__main__':
    app.run(debug=True)
    print("---Running---")


