from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

# Importar a instância do seu app Flask
from src.main import app as flask_app

# O Vercel espera uma variável chamada `app` ou `application`
app = flask_app


