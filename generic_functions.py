from flask import Flask, request, jsonify, make_response
from bson import ObjectId
from pymongo import MongoClient, results as pm_r
import jwt
import datetime
from functools import wraps
import bcrypt
from flask_cors import CORS
import math

def is_int(string_to_test):
  if isinstance(string_to_test, int):
    return string_to_test
  if string_to_test is None:
      return False
  try:
    return int(string_to_test)
  except ValueError:
    return False

# Public
def get_pagination_index(request, default_page_size=12, pn_name='pn', ps_name='ps'):
  user_pn = is_int(request.args.get(pn_name))
  user_ps = is_int(request.args.get(ps_name))

  print(request.args)
  print(user_pn)

  pn = 1
  ps = default_page_size



  if user_pn >= 1:
    pn = user_pn
    print('if isinstance(user_pn, int) and user_pn >= 1:')
    print(pn)
  if user_ps >= 1 and user_ps <= default_page_size:
    #Preventing providing too much information
    ps = user_ps
    print('if isinstance(user_ps, int) and user_ps >= 1:')
    print(ps)
  user_start_index = (ps * (pn - 1))
  print('user_start_index')
  print(user_start_index)

  return user_start_index, ps



# Public
def valid_id_format(id_for_format, base=16, id_length=24):
  print([id_for_format, base, id_length])
  try:
    if int(id_for_format, base) <= 0 or len(id_for_format) != id_length:
      return False
    else:
      return True
  except:
    return False



# Public
def collapse_ids(data_structure):
  #print(data_structure)
  if isinstance(data_structure, dict):
    data_structure = [data_structure]
  if isinstance(data_structure, list):
    for item in data_structure:
      list(get_dict_vals_by_key('_id', item, collapse_id))
  #print(data_structure)
  return data_structure


def collapse_id(data_structure, id_name='_id', id_attribute_name='$oid'):
  #Collapse all '_id' feilds
  #print(data_structure[id_name])
  data_structure[id_name] = str(data_structure[id_name])


def get_dict_vals_by_key(key, var, edit_result_function= None):
  if hasattr(var, 'iteritems') or hasattr(var, 'items'):
    items = []
    if hasattr(var, 'iteritems'):
      items = var.iteritems()
    else:
      items = var.items()
      for k, v in items:
        if k == key:
          # Set key
          if edit_result_function is not None:
            edit_result_function(var, key)
          yield v
        if isinstance(v, dict):
          for result in get_dict_vals_by_key(key, v, edit_result_function):
            yield result
        elif isinstance(v, list):
          for d in v:
            for result in get_dict_vals_by_key(key, d, edit_result_function):
              yield result


# Public
def prepare_results(documents):
  if isinstance(documents, list):
    prep = collapse_ids(documents)
    return prep
  elif isinstance(documents, dict):
    if 'type' in documents:
      if documents['type'] == 'insert':
        return str(documents['obj']['_id'])
      if documents['type'] == 'update':
        return str(documents['obj']['_id'])

  elif isinstance(documents, tuple) and len(documents) == 2:
    print('in isinstance(documents, tuple)')
    filt, cond = documents
    update_id = [value for key, value in filt.items() if '_id' in key][0]
    return str(update_id)

  else:
    print("is documents")
    prep = list(documents)
    if prep and len(prep) > 0:
      prep = collapse_ids(prep)
      return prep[0]
    else:
      return False


# Public
def is_error_message(db_result):
  return isinstance(db_result, dict) and 'error' in db_result

def api_link(request, new_id=None, source='http://localhost:5000',):
  path = source + request.path
  if new_id is not None:
    path += '/'+str(new_id)

  return path

############ Genercized FIND ##############
# Public
def find_one_document(database_con, id_for_result, sub_doc_path=[], sort=None, projection=None, match=[], id_name="_id", id_function=ObjectId):
    # This can be even more polymorphic since find_all and find_one send the same arguments to create find, howwever, that's a little too confusing
  pipe_line = create_find(id_for_results=id_for_result,
                          return_one=True,
                          sub_doc_path=sub_doc_path,
                          sort_obj=sort,
                          projection=projection,
                          match=match,
                          page_index=0,
                          page_size=1,
                          id_name=id_name,
                          id_function=id_function)

  return database_con.aggregate(pipe_line)


# May need to convert to list if a generator like object or cursor

# Public
def find_all_documents(database_con, super_id_for_results=None, sub_doc_path=[], sort=None, projection=None, match=[], page_index=0, page_size=12, id_name="_id", id_function=ObjectId
                       , final_match=None, distinct=False):
    # super_id_for_results can be none if searching all buisnesses - as it's the root document
  """

    @param database_con:
    @param super_id_for_results:
    @param sub_doc_path:
    @param sort:
    @param projection:
    @param page_number:
    @param page_size:
    @param id_name:
    @param id_function:
    @return:
  """
  pipe_line = create_find(id_for_results=super_id_for_results,
                          return_one=False,
                          sub_doc_path=sub_doc_path,
                          sort_obj=sort,
                          projection=projection,
                          match=match,
                          page_index=page_index,
                          page_size=page_size,
                          id_name=id_name,
                          id_function=id_function,
                          final_match=final_match,
                          distinct=distinct)

  return database_con.aggregate(pipe_line)


# May need to convert to list if a generator like object or cursor

def create_find(id_for_results=None, return_one=False, sub_doc_path=[], sort_obj=None, projection=None, match=[], page_index=0, page_size=12, id_name="_id", id_function=ObjectId, final_match=None, distinct=False):
    # e.g. for violations of specific inspection: create_find('5dee77c28124f41ab81441e8', False, sub_doc_path=["inspections","violations"])
    # e.g. for buisnesses: create_find()
    # e.g. for specific buisness: create_find('5dee77c28124f41ab81441e4', True)

    # If return_one is False then SuperID should be provided (leave as None if already at document root)
    # If return_one is True then ID of specific document/subdocument should be provided
  '''
  MongoDB aggragrate evaluation for finding all violations[
    {'$match': {'inspections._id': ObjectId('5dee77c28124f41ab81441e8')}},
    {'$project': {'_id': 0, 'inspections': 1}},
    {'$match': {'inspections._id': ObjectId('5dee77c28124f41ab81441e8')}},
    {'$unwind': {'path': '$inspections'}},
    {'$replaceRoot': {'newRoot': '$inspections'}},
    {'$match': {'_id': ObjectId('5dee77c28124f41ab81441e8')}},
    {'$unwind': {'path': '$violations'}},
    {'$replaceRoot':{'newRoot': '$violations'}},
    {'$sort': {'risk_category': -1}},
    {'$skip':0},
    {'$limit':12}
  ]
  '''

    # Could expand to remove all arrays in retured data - therefore only required information is provided, but tbh I've sent like 5x as long on this as I should already

    # Need check or functionility for providing sub_doc_path without id_for_results

    # N-level searching assuming _id are unique - way too powerful for this but why not, right?
  #Dictionary of result path varitions
  r_p={
    'r_container':      ".".join(sub_doc_path.copy()[:-1]),
    'r_container_id':   ".".join(sub_doc_path.copy()[:-1]+[id_name]),
    'r_path':           ".".join(sub_doc_path.copy()),
    'r_path_id':        ".".join(sub_doc_path.copy()+[id_name]),
    'r_l_container':    sub_doc_path.copy()[:-1],
    'r_l_container_id': sub_doc_path.copy()[:-1]+[id_name],
    'r_l_path':         sub_doc_path.copy(),
    'r_l_path_id':      sub_doc_path.copy()+[id_name],
  }


  '''  doc_path = ''
    doc_path_raw = ''
    if return_one:# May be reversed
      doc_path_raw = sub_doc_path.copy()
      doc_path_raw.append(id_name)
      doc_path = ".".join(doc_path_raw)
    else:
      doc_path_raw = sub_doc_path.copy()[: -1]
      doc_path_raw.append(id_name)
      doc_path = ".".join(doc_path_raw)
    '''

  # match isn't used when browsing all in a collection of documents
  initial_match_obj = {"$match": {}}


  if id_for_results is not None:
    print('id_for_results != None')
    key = r_p['r_path_id'] if return_one else r_p['r_container_id']
      #I.E. searching for specific document rather than a collection
    print(key)
    initial_match_obj["$match"] = {key: id_function(id_for_results)}

  for match_filter in match:
    initial_match_obj["$match"][r_p['r_path']+match_filter[0]] = match_filter[1]

  pipe_line = [initial_match_obj]

  if projection:
      # Could expand - ensure the required field is present
    project_obj = {"$project": projection}
    pipe_line.append(project_obj)
  elif len(r_p['r_l_path']) > 0:
    project_obj = {"$project": {
      r_p['r_l_path'][0]: 1
    }}
    pipe_line.append(project_obj)

  levels_to_traverse = r_p['r_l_path_id'].copy() if return_one else r_p['r_l_container_id'].copy()
  print(['levels_to_traverse', levels_to_traverse])
  print(["r_p['r_l_path'].copy()", r_p['r_l_path'].copy()])

  for sub_doc in r_p['r_l_path'].copy():
    sub_match_obj = {"$match": {
      ".".join(levels_to_traverse): id_function(id_for_results)
    }}
    print(levels_to_traverse)
    levels_to_traverse.pop(0)
    print(levels_to_traverse)

    unwind_obj = {'$unwind': {
      'path': '$' + sub_doc
    }}

    replaceRoot_obj = {'$replaceRoot': {
      'newRoot': '$' + sub_doc
    }}

    pipe_line.extend([sub_match_obj, unwind_obj, replaceRoot_obj])

  if return_one and len(r_p['r_l_path'].copy()) > 0:
    pipe_line.append({'$match': {id_name: id_function(id_for_results)}})

  if final_match:
    pipe_line.append({'$match': final_match})

  #need to add match here for advanced functionility

  if sort_obj is not None:
    sort_obj = {'$sort': sort_obj}
    pipe_line.append(sort_obj)

  current_page = math.ceil(page_index / page_size)+1

  #current_page += 1 if page_index % page_size else 0

  pagination = [
    {'$group': {
      '_id': None,
      'count': {'$sum': 1},
      'results': {'$push': '$$ROOT'},
    }}, {'$project': {
      '_id': 0,
      'count': 1,
      'current_page': {'$literal': current_page},
      'last_page': {'$ceil': {'$divide': ['$count', {'$literal': page_size}]}},
      'start_index': {'$literal': page_index},
      'page_size': {'$literal': page_size},
      'results': {
        '$slice': [
          '$results', page_index, page_size
        ]
      }
    }}
  ]

  pipe_line.extend(pagination)

  print(pipe_line)

  return pipe_line


############ Genercized UPDATE ##############
# Public
def update_document(database_con, id_val, request_obj, required_fields=[], optional_fields=[], auto_key_val_pairs=[], fields_inc_update=[], id_name="_id", id_function=ObjectId):
  #cursor = find_one_document(database_con=database_con, id_for_result=id_val, sub_doc_path=fields_inc_update, match=[], id_name=id_name, id_function=id_function);
  #
  #print('list(cursor)')
  #print(list(cursor))


  update_tuple = create_update(id_val=id_val,
                               request_obj=request_obj,
                               required_fields=required_fields,
                               optional_fields=optional_fields,
                               auto_key_val_pairs=auto_key_val_pairs,
                               fields_inc_update=fields_inc_update,
                               id_name=id_name,
                               id_function=id_function)

  print(['318 update_tuple',update_tuple])

  update_result = update_document_db(database_con=database_con,
                                     update_tuple=update_tuple,
                                     is_sub_doc=True if len(fields_inc_update)>0 else False)
  print(['322 update_result', update_result])

  return update_result


def update_str_path(path, value):
  if len(path) > 0:
    new_path = ".$[].".join(path.copy())
    new_path = new_path + ".$[subdoc]."+ value
    return new_path
  else:
    return value

def create_update(id_val, request_obj, required_fields=[], optional_fields=[], auto_key_val_pairs=[], fields_inc_update=[], id_name="_id", id_function=ObjectId):
  # db.businesses.update({'_id':ObjectId('5dee77c28124f41ab81441fe')},{'$set':{"review_count":'2'}})
  # db.businesses.update({'inspections._id':ObjectId('5dee77c28124f41ab81441ff')},{'$set':{"inspections.$[sub_doc].inspection_id":'Yes'}},{'arrayFilters':[{'sub_doc._id':ObjectId('5dee77c28124f41ab81441ff')}],'multi':False})
  # db.businesses.update({'inspections.violations._id':ObjectId('5dee77c28124f41ab8144200')},{'$set':{"inspections.$[].violations.$[sub_doc].risk_category":'Yes'}},{'arrayFilters':[{'sub_doc._id':ObjectId('5dee77c28124f41ab8144200')}],'multi':False})
  # db.businesses.update({'inspections._id': ObjectId('5dee77c28124f41ab81441ff')}, {'$set': {'inspections.$[sub_doc].last_mofified': '2019/12/15 23:42:20'}}, {'arrayFilters': [{'sub_doc._id': ObjectId('5dee77c28124f41ab81441ff')}], 'multi': false})


# db.businesses.update({'inspections._id': ObjectId('5dee77c28124f41ab81441ff')}, {'$set': {'inspections.$[subdoc].last_mofified': '2019/12/15 23:45:35'}}, {'arrayFilters': [{'subdoc._id': ObjectId('5dee77c28124f41ab81441ff')}], 'multi': False})
  # #'.$[].'.join(fields_inc_update)+'.$[sub_doc].'+requstField : requestVal

  """
      fields_inc_update should be empty when editing a busness - otherwise it will update a subdocument following the list as a path
      @param id_val: Value of (sub/)document being updated
      @param request_obj: The request from the user - which includes feilds used to update
      @param required_fields: Fields required to be entered to update a document (optional fields may be added later)
      @param auto_key_val_pairs: List of feilds (not included in request) that should be populated by the system (not the user) and thier value (like for last modified date)
      @param fields_inc_update: A file path to get to the document that has the id_val
      @param id_name: Incase _id chnages, here to reduce effect
      @param id_function: Incare ObjectID changes, here to reduce effect
      @return: A tuple (that may need to be extracted like a,b = create_update(...) or *create_update(...) if in arguments for function) of the filter and update objects
  """'''
    e.g. Business (exclude feilds you can't edit) (Need to include optional fields - but can be acceived by only passing fields being checked) (Need to beable to run fuction to update totals - perhaps a decorator)
      result = businesses.update_one(*create_update(
        '5dee77c28124f41ab81441eb',
        request,
        ['business_account_number','business_address','business_city','business_id','business_name','business_phone_number', 'business_postal_code', 'business_start_date', 'mail_address', 'mail_city', 'mail_zipcode', 'naics_code_description', 'ownership_name', 'supervisor_district'],
        []
      ))

    e.g. Violation
      result = businesses.update_one(*create_update(
        '5dee77c28124f41ab81441eb',
        request,
        [risk_category, violation_description, violation_id],
        [],
        ['inspections', 'violations']
      ))
  '''
  id_to_update = {
    ".".join(fields_inc_update+[id_name]): id_function(id_val)
  }





  #hardcode = {},{'$set':{}},{}

  #b._id ObjectId('5dee77c28124f41ab81441fe')
  #i._id ObjectId('5dee77c28124f41ab81441ff')
  #v._id ObjectId('5dee77c28124f41ab8144200')


  print(['id_to_update', id_to_update])

  updated_item = {}

  for o_f in optional_fields:
    print([o_f, updated_item])
    if o_f in request_obj.form:
      updated_item[update_str_path(fields_inc_update, o_f)] = request_obj.form[o_f]
  print(['updated_item',updated_item])
  for key_val_pair in auto_key_val_pairs:
    key_in_pair = key_val_pair[0]
    val_in_pair = key_val_pair[1]
    if key_in_pair not in updated_item:
      # Overrides exciting - but wont overide whats define h
      updated_item[update_str_path(fields_inc_update, key_in_pair)] = val_in_pair
  print(['updated_item', updated_item])
  for r_f in required_fields:
    updated_item[update_str_path(fields_inc_update, r_f)] = request_obj.form[r_f]
  print(['updated_item', updated_item])

  updated_item = {"$set": updated_item}
  print(['updated_item', updated_item])

  '''for r_f in required_fields:
      path = fields_inc_update.copy()+[r_f]
      updated_item[".$.".join(path)] = request_obj.form[r_f]

    for key_val_pair in auto_key_val_pairs:
      path = fields_inc_update
      path.append(key_val_pair[0])
      key_in_pair = ".$.".join(path)
      val_in_pair = key_val_pair[1]
      updated_item[key_in_pair] = val_in_pair'''

  if len(fields_inc_update) > 0:
    #return [(id_to_update, updated_item), {'upsert':False, 'arrayFilters': [{'subdoc._id': id_function(id_val)}], 'multi': False}]
    return (id_to_update, updated_item), {'upsert': False, 'array_filters': [{'subdoc._id': id_function(id_val)}]}
  else:
    return id_to_update, updated_item


def update_document_db(database_con, update_tuple, is_sub_doc=False):
  """
  Recives the build update and updates the database with it
  @param database_con: MongoClient collection being updated
  @param update_tuple: The (filter,update) tuple from create_update
  @return: Updated document
  """

  if is_sub_doc:
    (update_tuple, kwargs) = update_tuple
    database_con.update_one(*update_tuple, **kwargs)
  else:
    database_con.update(*update_tuple)

  return update_tuple


############ Genercized INSERT ##############
# Public
def insert_document(database_con, request_obj, required_fields, optional_fields=[], auto_key_val_pairs=[], fields_inc_update=[], super_id=None, id_name = "_id", id_function = ObjectId):
  # If sub-document:	then fields_inc_update needs to have path (excuding the business itself) to array being added to
  #					super_id needs to have the id of the document/sub-document

  # e.g. for new business
  # add_item_db(
  #		request,
  #		['business_account_number','business_address','business_city','business_id','business_name','business_phone_number', 'business_postal_code', 'business_start_date', 'mail_address', 'mail_city', 'mail_zipcode', 'naics_code_description', 'ownership_name', 'supervisor_district'],
  #		[["business_latitude",''], ["business_location",''], ["business_longitude",''], ["business_state",'CA'], ["inspection_count",0], ["inspections",[]], ["mail_state","CA"], ["review_count",0], ["reviews",[]] ]
  #	)

  # e.g. for new review
  # add_item_db(
  #		request,
  #		['date', 'stars', 'text', 'username'],
  #		[["votes",{"down":0,"up":0}]],
  #		['reviews'],
  #		'5dee77c28124f41ab81441ec'
  #	)

  # e.g. for new violation (inside inspection _id:'5dee77c28124f41ab81441ec')
  # add_item_db(
  #		request,
  #		['risk_category', 'violation_description', 'violation_id'],
  #		[],
  #		['inspections','violations'],
  #		'5dee77c28124f41ab81441ec'
  #	)

  # fields_inc_update - if empty then inserting new buisness, otherwise updating subdocument
  is_valid = validate_request_form_values(request_obj, required_fields)
  print(is_valid)
  if isinstance(is_valid, dict) and 'error' in is_valid:
    error_message = is_valid
    print('returning error')
    return error_message
  else:
    insert_obj = create_insert(
      request_obj=request_obj,
      required_fields=required_fields,
      optional_fields=optional_fields,
      auto_key_val_pairs=auto_key_val_pairs)

    insert_result = insert_document_db(
      database_con=database_con,
      insert_obj=insert_obj,
      fields_inc_update=fields_inc_update,
      super_id=super_id,
      id_name=id_name,
      id_function=id_function)

    #Can get ID with str(insert_result.inserted_id)
    return insert_result


def validate_request_form_values(request_obj, required_fields):
  if not hasattr(request_obj, 'form'):
    return {"error": "Request object doesn't have a form attribute"}
  elif len(required_fields) < 1:
    return {"error": "No required fields have been provided"}

  invalid_fields = []

  for r_f in required_fields:
    if r_f not in request_obj.form:
      invalid_fields.append(r_f)

  if len(invalid_fields) == 0:
    return True
  else:
    print('should be an error')
    return {"error": "You must provide the following fields: " + ", ".join(invalid_fields)}


def create_insert(request_obj, required_fields, optional_fields=[], auto_key_val_pairs=[]):
  # Could expand with optional fields
  add_obj = {}

  #JSON uses null, so if not implct then will cause error
  unset_val = None

  for o_f in optional_fields:
    optional_val = unset_val
    if o_f in request_obj.form:
      optional_val=request_obj.form[o_f]
    add_obj[o_f] = optional_val

  for key_val_pair in auto_key_val_pairs:
    key_in_pair = key_val_pair[0]
    val_in_pair = key_val_pair[1]
    if key_in_pair not in add_obj or add_obj[key_in_pair] is unset_val:
      #Only override if value is set
      add_obj[key_in_pair] = val_in_pair

  for r_f in required_fields:
    add_obj[r_f] = request_obj.form[r_f]

  return add_obj


def create_sub_doc_insert(insert_object, super_id, fields_inc_update, id_name="_id", id_function=ObjectId):
  find_path = fields_inc_update[:-1]
  find_path.append(id_name)
  find_path = ".".join(find_path)

  find_val = {
    find_path: id_function(super_id)
  }

  insert_object['_id'] = ObjectId()

  update_pro = {
    "$push": {
      ".$.".join(fields_inc_update.copy()): insert_object
    }
  }

  return (find_val, update_pro), insert_object


# e.g. {"inspections._id" : ObjectId('5dee77c28124f41ab8144202')},
#    {"$push" : {"inspections.$.violations" : ...}}
# From create_insert_sub_doc(..., '5dee77c28124f41ab8144202', ['inspections','violations'])


def insert_document_db(database_con, insert_obj, fields_inc_update=[], super_id=None, id_name="_id", id_function=ObjectId):
  # Also works with subdocuments
  insert_result = None

  print(fields_inc_update)

  if len(fields_inc_update) == 0:
    print('database_con.insert_one...')
    insert_result = database_con.insert_one(insert_obj)
  else:
    print('create_sub_doc_insert...')
    update_tuple, insert_object = create_sub_doc_insert(insert_object=insert_obj,
                                          super_id=super_id,
                                          fields_inc_update=fields_inc_update,
                                          id_name=id_name,
                                          id_function=id_function)
    database_con.update_one(*update_tuple)
  return {"type": "insert", "obj": insert_obj}


############ Genercized DELETE ##############
# Public
def delete_item(database_con, id_val, super_id=None, fields_inc_delete=[], id_name="_id", id_function=ObjectId):
  print(delete_item)
  delete_args = create_delete(id_val=id_val,
                                 super_id=super_id,
                                 fields_inc_delete=fields_inc_delete,
                                 id_name=id_name,
                                 id_function=id_function)

  delete_item_db(database_con=database_con,
                 delete_args=delete_args,
                 fields_inc_delete=fields_inc_delete)

  return {}


def create_delete(id_val, super_id=None, fields_inc_delete=[], id_name="_id", id_function=ObjectId):
  if len(fields_inc_delete) == 0:
    # Delete business - super ID should be None but doesn't actually matter
    print(1)
    return {id_name: id_function(id_val)}
  else:
    # Pull subdocument
    find_path = fields_inc_delete.copy()[:-1]
    find_path.append(id_name)
    find_path = ".".join(find_path)
    print(find_path)

    pull_path = fields_inc_delete.copy()
    pull_path = ".$.".join(pull_path)
    print(pull_path)

    find_obj = {find_path: id_function(super_id)}
    pull_obj = {
      "$pull": {
        pull_path: {
          "_id": id_function(id_val)
        }
      }
    }

    print(find_obj, pull_obj)

    return find_obj, pull_obj


def delete_item_db(database_con, delete_args, fields_inc_delete=[]):
  if len(fields_inc_delete) == 0:
    database_con.delete_one(delete_args)
  else:
    database_con.update_one(*delete_args)
