#TODO breadcrumbs

from flask import Flask, request, jsonify, make_response
from bson import ObjectId
from pymongo import MongoClient
import jwt
import datetime
#from datetime import datetime
from functools import wraps
import bcrypt
from flask_cors import CORS
from generic_functions import get_pagination_index, valid_id_format, prepare_results, api_link, is_error_message, find_one_document, find_all_documents, update_document, insert_document, delete_item, update_counts

DEBUG = False

app = Flask(__name__)
CORS(app)


#secret key
app.config['SECRET_KEY'] = 'b7Eb6egD5yfgkb85'

client = MongoClient("mongodb://127.0.0.1:27017")
db = client.bizDB   #select the database
#businesses = db.businesses #select the collection
businesses = db.businesses #select the collection

#If your application needs to address multiple collections (or even multiple databases), you can repeat these commands as often as you need, specifying different variable names, databases and collections as appropriate.
# application functionility will go hers
users = db.users
blacklist = db.blacklist

default_ps = 10

def jwt_required(func):
    @wraps(func)
    def jwt_required_wrapper(*args, **kwargs):
        #print()
        #token = request.args.get('token')
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
            #Postman, select basic auth
        if not token:
            return jsonify({'message' : 'Token is missing'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'])
            print('data')
            print(data)
        except:
            return jsonify({'message' : 'Token is invalid'}), 401
        bl_token = blacklist.find_one({"token":token})
        if bl_token is not None:
            return make_response(jsonify({'message':'Token has been cancelled'}),401)
        return func(*args, **kwargs)
    return jwt_required_wrapper


def admin_required(func):
    @wraps(func)
    def admin_required_wrapper(*args, **kwargs):
        if DEBUG:
          return func(*args, **kwargs)
        token = request.headers['x-access-token']
        data = jwt.decode(token, app.config['SECRET_KEY'])
        if data['admin']:
            return func(*args, **kwargs)
        else:
            return make_response(jsonify({'message':'Admin access required'}), 401)
    return admin_required_wrapper




'''
@app.route("/add_review_ids", methods=["GET"])#remember to remove!!!!
def add_review_ids():
    count = 0
    for business in businesses.find():
        new_reviews = []
        for review in business["reviews"]:
            new_review = {
                "_id":ObjectId(),
                "username":review["username"],
                "votes":review["votes"],
                "text":review["text"],
                "stars":review["stars"],
                "date":review["date"],
                "type":review["type"]
            }
            new_reviews.append(new_review)
        businesses.update_one({"_id":business["_id"]},{"$set":{"reviews":new_reviews}})
        count = count + 1
    return make_response("Affected " + str(count) + " items")

@app.route("/fix_review_count", methods=["GET"])#remember to remove!!!!
def fix_review_count():
    output = ""
    for business in businesses.find():
        if business["review_count"] != len(business["reviews"]):
            output = output + "Business " + str(business["_id"]) + " really has " + str(len(business["reviews"])) + " reviews <br>"
            businesses.update_one({"_id":business["_id"]},{"$set":{"review_count":len(business["reviews"])}})
        else:
            output = output + "Business " + str(business["_id"]) + " is OK<br>"
    return make_response(output)
'''

@app.route("/api/v1.0/businesses", methods=["GET"])
def show_all_businesses():
    print(businesses)
    index, size = get_pagination_index(request, default_ps)

    find_result = prepare_results(
      find_all_documents(
        database_con=businesses,
        page_index=index,
        page_size=size,
        projection={
          'inspections': 0,
          'reviews': 0
        },
      )
    )

    #'<div class="mapouter"><div class="gmap_canvas"><iframe width="600" height="500" id="gmap_canvas" src="https://maps.google.com/maps?q=' + encodeURIComponent(address) + '&t=k&z=19&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe><a href="https://www.whatismyip-address.com">show me where i am now</a></div><style>.mapouter{position:relative;text-align:right;height:500px;width:600px;}.gmap_canvas {overflow:hidden;background:none!important;height:500px;width:600px;}</style></div>'
    print(find_result)

    return make_response(jsonify(find_result), 200)

'''def update_counts(b_id):
  results = prepare_results(find_one_document(
    database_con=businesses,
    id_for_result=b_id
  )).results

  if results.length > 0:
    b_violation_count = 0;
    update_obj = {'form': {
      'review_count': results.reviews.length,
      'inspection_count': results.inspections.length,
    }}

    for in_pos in range(results.inspections.length):
      violation_path = 'inspections.'+in_pos+'.violation_count'
      violation_count = results.inspections[in_pos].violations.length
      update_obj[violation_path] = violation_count
      b_violation_count += violation_count

    update_obj['violation_count'] = b_violation_count

  update_document(
    database_con=businesses,
    id_val=b_id,
    request_obj=update_obj,
    required_fields=list(update_obj.form.keys()),
    auto_key_val_pairs=[
      ["last_modified", datetime.datetime.now().strftime('%Y/%m/%d %H:%M:%S')]
    ]
  )
  return make_response(jsonify({'success': 'Business values updated'}), 202)



#202'''

@app.route("/api/v1.0/businesses/<string:id>", methods=["GET"])#token will get picked up
def show_one_business(id):
    update_counts(id, businesses)
    if not valid_id_format(id):
        return make_response(jsonify({"error": "id is not a 24 digit hexidecimal string"}),404)

    find_result = prepare_results(
      find_one_document(
        database_con=businesses,
        id_for_result=id
      )
    )

    if find_result and len(find_result['results']) > 0:
      return make_response(jsonify( find_result ),200)
    else:
        return make_response(jsonify({"error": "Business does not exist"}),404)


@app.route("/api/v1.0/businesses", methods=["POST"])
#'@jwt_required
def add_business():
  result = insert_document(
    database_con=businesses,
    request_obj=request,
    required_fields=[
      "business_address",
      "business_postal_code",
      "business_name",
      "ownership_name",
    ],
    optional_fields=[
      "business_account_number",
      "business_start_date",
      "business_latitude",
      "business_longitude",
      "business_location",
      "business_phone_number",
      "mail_address",
      "mail_city",
      "mail_state",
      "mail_zipcode",
      "supervisor_district",
      "business_id"
    ],
    auto_key_val_pairs=[ # optional_fields are set to None here if not passed in optional_fields
      ["business_city", "San Francisco"],
      ["business_state", "CA"],
      ["inspection_count", 0],
      ["inspections", []],
      ["violation_count", 0],
      ["naics_code_description", "Food Services"],
      ["review_count", 0],
      ["reviews", []],
      ["business_start_date", datetime.datetime.now().strftime('%Y/%m/%d %H:%M:%S')]
    ]
  )

  if is_error_message(result):
    return make_response(jsonify(result), 404)
  else:
    result = prepare_results(result)

  return make_response(jsonify({"url": api_link(request, new_id=result)}), 201)


@app.route("/api/v1.0/businesses/<string:id>", methods=["PUT"])
#@jwt_required
def edit_business(id):
    if not valid_id_format(id):
        return make_response(jsonify({"error": "id is not a 24 digit hexidecimal string"}),404)
    '''elif "name" not in request.form or "city" not in request.form or "stars" not in request.form:
        return make_response(jsonify({"error": "Name, city and stars must be completed to submit"}),404)'''

    update_result = update_document(
      database_con=businesses,
      id_val=id,
      request_obj=request,
      optional_fields=[
        "business_address",
        "business_postal_code",
        "business_name",
        "ownership_name",
        "business_account_number",
        "business_start_date",
        "business_latitude",
        "business_longitude",
        "business_location",
        "business_phone_number",
        "mail_address",
        "mail_city",
        "mail_state",
        "mail_zipcode",
        "supervisor_district",
        "business_id",
        "business_city",
        "business_state",
        "naics_code_description",
        "business_start_date"
      ],
      auto_key_val_pairs=[
        ["last_modified", datetime.datetime.now().strftime('%Y/%m/%d %H:%M:%S')]
      ]
    )
    update_counts(id, businesses)
    #update_result = prepare_results(update_result)

    return make_response(jsonify({"updated": api_link(request)}), 200)


@app.route("/api/v1.0/businesses/<string:id>", methods=["DELETE"])
#@jwt_required
#@admin_required
def delete_business(id):
    #implement deleted count on generic function
    if not valid_id_format(id):
        return make_response(jsonify({"error": "id is not a 24 digit hexidecimal string"}),404)

    delete_item(
      database_con=businesses,
      id_val=id
    )

    update_counts(id, businesses)

    return make_response(jsonify({}), 200)

    #result = businesses.delete_one(
    #    {"_id" : ObjectId(id)}
    #)
    #if result.deleted_count == 1:


@app.route("/api/v1.0/businesses/<string:id>/reviews", methods=["GET"])
def fetch_all_reviews(id):
    if not valid_id_format(id):
        return make_response(jsonify({"error": "id is not a 24 digit hexidecimal string"}),404)

    index, size = get_pagination_index(request, default_ps)

    find_result = prepare_results(
      find_all_documents(
        database_con=businesses,
        super_id_for_results=id,
        sub_doc_path=[
          'reviews'
        ],
        page_index=index,
        page_size=size,
        sort={"date": -1},
      )
    )

    if find_result and len(find_result['results']) > 0:
      return make_response(jsonify( find_result ),200)
    else:
        return make_response(jsonify({"error": "There are no reviews for the business"}), 404)


@app.route("/api/v1.0/businesses/<string:b_id>/reviews/<string:r_id>", methods=["GET"])
def fetch_review(b_id, r_id):
    if not valid_id_format(b_id):
        return make_response(jsonify({"error": "Business id is not a 24 digit hexidecimal string"}),404)
    elif not valid_id_format(r_id):
        return make_response(jsonify({"error": "Review id is not a 24 digit hexidecimal string"}),404)

    find_result = prepare_results(
      find_one_document(
        database_con=businesses,
        id_for_result=r_id,
        sub_doc_path=[
          'reviews'
        ],
        sort={"date": -1}
      )
    )

    update_counts(b_id, businesses)

    if find_result and len(find_result['results']) > 0:
      return make_response(jsonify( find_result ),200)
    else:
        return make_response(jsonify({"error": "There is no such review"}), 404)


@app.route("/api/v1.0/businesses/<string:b_id>/reviews", methods=["POST"])
#@jwt_required
def add_new_review(b_id):
  if not valid_id_format(b_id):
    return make_response(jsonify({"error": "Business id is not a 24 digit hexidecimal string"}), 404)

  result = insert_document(
    database_con=businesses,
    request_obj=request,
    fields_inc_update=[
      'reviews'
    ],
    super_id=b_id,
    required_fields=[
      "username",
      "stars",
      "text",
    ],
    auto_key_val_pairs=[  # optional_fields are set to None here if not passed in optional_fields
      ["votes", {"down": 0, "up": 0}],
      ["date", datetime.datetime.now().strftime('%Y/%m/%d %H:%M:%S')],
    ]
  )

  update_counts(b_id, businesses)

  if is_error_message(result):
    return make_response(jsonify(result), 404)
  else:
    result = prepare_results(result)

  return make_response(jsonify({"url": api_link(request, new_id=result)}), 201)

@app.route("/api/v1.0/businesses/<string:b_id>/reviews/<string:r_id>", methods=["PUT"])
#@jwt_required
def edit_review(b_id, r_id):
    #Need code to validate what is entered
    if not valid_id_format(b_id):
        return make_response(jsonify({"error": "Business id is not a 24 digit hexidecimal string"}),404)
    elif not valid_id_format(r_id):
        return make_response(jsonify({"error": "Review id is not a 24 digit hexidecimal string"}),404)

    update_result = update_document(
      database_con=businesses,
      id_val=r_id,
      request_obj=request,
      fields_inc_update=[
        "reviews"
      ],
      optional_fields=[
        "stars",
        "text",
        "username",
        "date"
      ],
      auto_key_val_pairs=[
        ["last_modified", datetime.datetime.now().strftime('%Y/%m/%d %H:%M:%S')],
      ]
    )

    update_counts(b_id, businesses)

    return make_response(jsonify({"updated": api_link(request)}), 200)


@app.route("/api/v1.0/businesses/<string:b_id>/reviews/<string:r_id>", methods=["DELETE"])
#@jwt_required
#@admin_required
def delete_review(b_id, r_id):
    #Need code to validate what is entered
    if not valid_id_format(b_id):
        return make_response(jsonify({"error": "Business id is not a 24 digit hexidecimal string"}),404)
    elif not valid_id_format(r_id):
        return make_response(jsonify({"error": "Review id is not a 24 digit hexidecimal string"}),404)

    delete_item(
      database_con=businesses,
      id_val=r_id,
      super_id=b_id,
      fields_inc_delete=[
        "reviews"
      ],
    )

    update_counts(b_id, businesses)

    return make_response(jsonify({}), 200)






@app.route("/api/v1.0/businesses/<string:id>/inspections", methods=["GET"])
def fetch_all_inspections(id):
    if not valid_id_format(id):
        return make_response(jsonify({"error": "id is not a 24 digit hexidecimal string"}),404)

    index, size = get_pagination_index(request, default_ps)

    find_result = prepare_results(
      find_all_documents(
        database_con=businesses,
        super_id_for_results=id,
        sub_doc_path=[
          'inspections'
        ],
        page_index=index,
        page_size=size,
        sort={"date": -1},
        projection={
          #'violations':0
        },
      )
    )

    update_counts(id, businesses)

    if find_result and len(find_result['results']) > 0:
      return make_response(jsonify( find_result ),200)
    else:
        return make_response(jsonify({"error": "There are no inspection for the business"}), 404)


@app.route("/api/v1.0/businesses/<string:b_id>/inspections/<string:i_id>", methods=["GET"])
def fetch_inspection(b_id, i_id):
    if not valid_id_format(b_id):
        return make_response(jsonify({"error": "Business id is not a 24 digit hexidecimal string"}),404)
    elif not valid_id_format(i_id):
        return make_response(jsonify({"error": "Inspection id is not a 24 digit hexidecimal string"}),404)

    find_result = prepare_results(
      find_one_document(
        database_con=businesses,
        id_for_result=i_id,
        sub_doc_path=[
          'inspections'
        ],
        sort={"date": -1}
      )
    )

    update_counts(b_id, businesses)

    if find_result and len(find_result['results']) > 0:
      return make_response(jsonify(find_result), 200)
    else:
      return make_response(jsonify({"error": "No such inspection"}), 404)


@app.route("/api/v1.0/businesses/<string:b_id>/inspections", methods=["POST"])
#@jwt_required
def add_new_inspection(b_id):
  if not valid_id_format(b_id):
    return make_response(jsonify({"error": "Business id is not a 24 digit hexidecimal string"}), 404)

  result = insert_document(
    database_con=businesses,
    request_obj=request,
    fields_inc_update=[
      'inspections'
    ],
    super_id=b_id,
    required_fields=[
      "inspection_type",
      "inspection_id",
    ],
    optional_fields=[
      'inspection_score'
    ],
    auto_key_val_pairs=[  # optional_fields are set to None here if not passed in optional_fields
      ["violations", []],
      ["violation_count",0],
      ["inspection_date", datetime.datetime.now().strftime('%Y/%m/%d %H:%M:%S')],
    ]
  )

  update_counts(b_id, businesses)

  if is_error_message(result):
    return make_response(jsonify(result), 404)
  else:
    result = prepare_results(result)

  return make_response(jsonify({"url": api_link(request, new_id=result)}), 201)


@app.route("/api/v1.0/businesses/<string:b_id>/inspections/<string:i_id>", methods=["PUT"])
#@jwt_required
def edit_inspection(b_id, i_id):
    #Need code to validate what is entered
    if not valid_id_format(b_id):
        return make_response(jsonify({"error": "Business id is not a 24 digit hexidecimal string"}),404)
    elif not valid_id_format(i_id):
        return make_response(jsonify({"error": "Inspection id is not a 24 digit hexidecimal string"}),404)

    update_result = update_document(
      database_con=businesses,
      id_val=i_id,
      request_obj=request,
      fields_inc_update=[
        "inspections"
      ],
      optional_fields=[
        "inspection_type",
        "inspection_id",
        "inspection_score",
        "inspection_date"
      ],
      auto_key_val_pairs=[
        ["last_mofified", datetime.datetime.now().strftime('%Y/%m/%d %H:%M:%S')],
      ]
    )

    update_counts(b_id, businesses)

    return make_response(jsonify({"updated": api_link(request)}), 200)


    print(update_result)
    '''edited_inspection = {
        "inspections.$.inspection_id" : request.form["inspection_id"],
        "inspections.$.inspection_type" : request.form["inspection_type"],
        "inspections.$.inspection_score" : request.form["inspection_score"],
        "inspections.$.inspection_date" : request.form["inspection_date"],
    }

    businesses.update_one(
        {"inspections._id" : ObjectId(i_id)},
        {"$set" : edited_inspection}
    )

    edit_inspection_url = "http://localhost:5000/api/v1.0/businesses/" + b_id + "/inspections/" + i_id

    return make_response(jsonify({"url":edit_inspection_url}),200)'''


@app.route("/api/v1.0/businesses/<string:b_id>/inspections/<string:i_id>", methods=["DELETE"])
#@jwt_required
#@admin_required
def delete_inspection(b_id, i_id):
    #Need code to validate what is entered
    if not valid_id_format(b_id):
        return make_response(jsonify({"error": "Business id is not a 24 digit hexidecimal string"}),404)
    elif not valid_id_format(i_id):
        return make_response(jsonify({"error": "Inspection id is not a 24 digit hexidecimal string"}),404)

    delete_item(
      database_con=businesses,
      id_val=i_id,
      super_id=b_id,
      fields_inc_delete=[
        "inspections"
      ],
    )

    update_counts(b_id, businesses)

    return make_response(jsonify({}), 200)


@app.route("/api/v1.0/businesses/<string:b_id>/inspections/<string:i_id>/violations", methods=["GET"])
def fetch_all_violations(b_id, i_id):
  if not valid_id_format(b_id):
    return make_response(jsonify({"error": "Business id is not a 24 digit hexidecimal string"}), 404)
  elif not valid_id_format(i_id):
    return make_response(jsonify({"error": "Inspection id is not a 24 digit hexidecimal string"}), 404)

  index, size = get_pagination_index(request, default_ps)

  find_result = prepare_results(
    find_all_documents(
      database_con=businesses,
      super_id_for_results=i_id,
      sub_doc_path=[
        'inspections',
        'violations'
      ],
      page_index=index,
      page_size=size
    )
  )

  update_counts(b_id, businesses)

  if find_result and len(find_result['results']) > 0:
    return make_response(jsonify(find_result), 200)
  else:
    return make_response(jsonify({"error": "There are no violations for the inspection"}), 404)


@app.route("/api/v1.0/businesses/<string:b_id>/inspections/<string:i_id>/violations/<string:v_id>", methods=["GET"])
def fetch_violation(b_id, i_id, v_id):
  if not valid_id_format(b_id):
    return make_response(jsonify({"error": "Business id is not a 24 digit hexidecimal string"}), 404)
  elif not valid_id_format(i_id):
    return make_response(jsonify({"error": "Inspection id is not a 24 digit hexidecimal string"}), 404)
  elif not valid_id_format(v_id):
    return make_response(jsonify({"error": "Violation id is not a 24 digit hexidecimal string"}), 404)

  find_result = prepare_results(
    find_one_document(
      database_con=businesses,
      id_for_result=v_id,
      sub_doc_path=[
        'inspections',
        'violations'
      ],
    )
  )
  update_counts(b_id, businesses)

  if find_result and len(find_result['results']) > 0:
    return make_response(jsonify(find_result), 200)
  else:
    return make_response(jsonify({"error": "No such violation"}), 404)



@app.route("/api/v1.0/businesses/<string:b_id>/inspections/<string:i_id>/violations", methods=["POST"])
# @jwt_required
def add_new_violation(b_id, i_id):
  if not valid_id_format(b_id):
    return make_response(jsonify({"error": "Business id is not a 24 digit hexidecimal string"}), 404)
  if not valid_id_format(i_id):
    return make_response(jsonify({"error": "Inspection id is not a 24 digit hexidecimal string"}), 404)

  result = insert_document(
    database_con=businesses,
    request_obj=request,
    fields_inc_update=[
      'inspections',
      'violations'
    ],
    super_id=i_id,
    required_fields=[
      "risk_category",
      "violation_description",
      "violation_id"
    ],
    auto_key_val_pairs=[  # optional_fields are set to None here if not passed in optional_fields
      ["date", datetime.datetime.now().strftime('%Y/%m/%d %H:%M:%S')],
    ]
  )
  update_counts(b_id, businesses)

  if is_error_message(result):
    return make_response(jsonify(result), 404)
  else:
    result = prepare_results(result)

  return make_response(jsonify({"url": api_link(request, new_id=result)}), 201)


@app.route("/api/v1.0/businesses/<string:b_id>/inspections/<string:i_id>/violations/<string:v_id>", methods=["PUT"])
# @jwt_required
def edit_violation(b_id, i_id, v_id):
  # Need code to validate what is entered
  if not valid_id_format(b_id):
    return make_response(jsonify({"error": "Business id is not a 24 digit hexidecimal string"}), 404)
  elif not valid_id_format(i_id):
    return make_response(jsonify({"error": "Inspection id is not a 24 digit hexidecimal string"}), 404)
  elif not valid_id_format(v_id):
    return make_response(jsonify({"error": "Violation id is not a 24 digit hexidecimal string"}), 404)

  update_result = update_document(
    database_con=businesses,
    id_val=v_id,
    request_obj=request,
    fields_inc_update=[
      "inspections",
      "violations"
    ],
    optional_fields=[
      "risk_category",
      "violation_description",
      "violation_id",
      "date"
    ],
    auto_key_val_pairs=[
      ["last_modified", datetime.datetime.now().strftime('%Y/%m/%d %H:%M:%S')],
    ]
  )
  update_counts(b_id, businesses)

  return make_response(jsonify({"updated": api_link(request)}), 200)

  print(update_result)

  '''edited_violation = {
    "violations.$.risk_category": request.form["risk_category"],
    "violations.$.violation_description": request.form["violation_description"],
    "violations.$.violation_id": request.form["violation_id"],
  }

  businesses.update_one(
    {"inspections.violations._id": ObjectId(i_id)},
    {"$set": edited_violation}
  )

  edit_violation_url = "http://localhost:5000/api/v1.0/businesses/" + b_id + "/inspections/" + i_id + '/violations/' + v_id

  return make_response(jsonify({"url": edit_violation_url}), 200)'''


@app.route("/api/v1.0/businesses/<string:b_id>/inspections/<string:i_id>/violations/<string:v_id>", methods=["DELETE"])
def delete_violation(b_id, i_id, v_id):
  print('tried to delete violation')
  # Need code to validate what is entered
  if not valid_id_format(b_id):
    return make_response(jsonify({"error": "Business id is not a 24 digit hexidecimal string"}), 404)
  elif not valid_id_format(i_id):
    return make_response(jsonify({"error": "Inspection id is not a 24 digit hexidecimal string"}), 404)
  elif not valid_id_format(v_id):
    return make_response(jsonify({"error": "Violation id is not a 24 digit hexidecimal string"}), 404)

  delete_item(
    database_con=businesses,
    id_val=v_id,
    super_id=i_id,
    fields_inc_delete=[
      "inspections",
      "violations"
    ],
  )
  update_counts(b_id, businesses)

  return make_response(jsonify({}), 200)

@app.route("/api/v1.0/codes", methods=["GET"])
def get_distinct_zipcodes():
    find_result = prepare_results(
      find_all_documents(
        database_con=businesses,
        page_size=9000,
        sort={
          'business_postal_code' : -1
        },
        projection={
          'business_postal_code':1,
          '_id':0
        },
        distinct='business_postal_code'
      )
    )
    print(find_result)
    if find_result and len(find_result['results']) > 0:
      return make_response(jsonify( find_result ),200)
    else:
        return make_response(jsonify({"error": "Zipcode has no SanFran businesses"}),404)


@app.route("/api/v1.0/codes/<int:c_id>", methods=["GET"])#token will get picked up
def show_zipcode(c_id):
    index, size = get_pagination_index(request, default_ps)
    find_result = prepare_results(
      find_all_documents(
        database_con=businesses,
        page_index=index,
        page_size=5,
        sort={
          'business_name' : 1
        },
        projection={
          'inspections':0,
          'reviews':0
        },
        final_match={
          'business_postal_code': c_id
        },
      )
    )
    print(find_result)
    if find_result and len(find_result['results']) > 0:
      return make_response(jsonify( find_result ),200)
    else:
        return make_response(jsonify({"error": "Zipcode has no SanFran businesses"}),404)

@app.route("/api/v1.0/businesses/<string:b_id>/reviews/<string:r_id>/vote/<string:vote>", methods=["GET"])
def vote_review(b_id, r_id, vote):
    if not valid_id_format(b_id):
        return make_response(jsonify({"error": "Business id is not a 24 digit hexidecimal string"}),404)
    elif not valid_id_format(r_id):
        return make_response(jsonify({"error": "Review id is not a 24 digit hexidecimal string"}),404)
    if not (vote == "up" or vote == "down"):
      return make_response(jsonify({"error": "Vote value is invalid"}), 404)

    find_result = prepare_results(
      find_one_document(
        database_con=businesses,
        id_for_result=r_id,
        sub_doc_path=[
          'reviews'
        ]
      )
    )

    vote_count = find_result['results'][0]['votes'][vote] + 1;
    req2 = {'form':{'votes.'+vote: vote_count}}
    update_document(
      database_con=businesses,
      id_val=r_id,
      request_obj=req2,
      fields_inc_update=[
        "reviews"
      ],
      auto_key_val_pairs=[
        ['votes.'+str(vote), vote_count]
      ]
    )

    update_counts(b_id, businesses)

    return make_response(jsonify({"updated": "vote"}), 200)

@app.route("/api/v1.0/login", methods=["GET"])
def login():
    print('logging in')
    auth = request.authorization

    if auth:
        user = users.find_one({'username':auth.username})
        if user is not None:
            if bcrypt.checkpw(bytes(auth.password, 'UTF-8'), user["password"]):
                token = jwt.encode({
                    'user':auth.username,
                    'admin':user['admin'],
                    'exp': datetime.datetime.now() + datetime.timedelta(minutes=30)
                }, app.config['SECRET_KEY'])
                return make_response(jsonify({'token':token.decode('UTF-8')}),200)
            else:
                return make_response(jsonify({'message':'Bad password'}),401)
        else:
            return make_response(jsonify({'message':'Bad username'}),401)
    return make_response(jsonify({'message':'Authentication required'}),401)


    # if auth and auth.password == 'password':
    #     token = jwt.encode({
    #         'user' : auth.username,
    #         'exp' : datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    #     }, app.config['SECRET_KEY'])
    #     return jsonify({'token' : token.decode('UTF-8')})


    #return make_response('Could not verify', 401, {'WWW-Authenticate' : 'Basic realm = "Login required"'})


@app.route('/api/v1.0/logout', methods=['GET'])
@jwt_required
def logout():
    token = None
    if 'x-access-token' in request.headers:
        token = request.headers['x-access-token']
    if not token:
        return make_response(jsonify({'message':'Token is missing'}), 401)
    else:
        blacklist.insert_one({'token':token})
        return make_response(jsonify({'message':'Logout successful'}), 200)




if __name__ == "__main__":
    app.run(debug=True)




