import json
from flask import Flask, Response, request

app = Flask(__name__)

@app.route("/", methods=['POST'])
def review_handler():
    data = request.json
    try:
        data = parse_post_body(data)
        response_dict = {
            "url": data['url'],
            "aggregate_rating": 4.7,
            "num_author": 1234
        }
        data = json.dumps(response_dict)
        res = Response(
            response=data,
            status=200,
            mimetype="application/json"
        )
        return res
    except Exception as e:
        print e

def parse_post_body(data):
    result = dict()
    try:
        for thing in data:
            url = thing.get('url')
            filter_type = thing.get('type')
            if url:
                result['url'] = url
            if filter_type:
                result[filter_type] = thing['value']
    except Exception as e:
        print e

    return result

if __name__ == "__main__":
    app.run()
