import csv
import json
from bson import ObjectId
from random import randint
import datetime

'''
with open('P:\\Final year\\COM633- Full Stack\\database backups\\business_san_fran.csv', newline='') as csvfile:
    business = list(csv.reader(csvfile))

with open('P:\\Final year\\COM633- Full Stack\\database backups\\inspection_san_fran.csv', newline='') as csvfile:
    inspection = list(csv.reader(csvfile))

with open('P:\\Final year\\COM633- Full Stack\\database backups\\violation_san_fran.csv', newline='') as csvfile:
    violation = list(csv.reader(csvfile))

b_f = business.pop(0)
i_f = inspection.pop(0)
v_f = violation.pop(0)

business_size = len(business)
print(str(business_size) + ' records')
# matches = (x for x in inspection if business[0][0] == x[0])
#
# canContinue = True
# while canContinue:
#     val = next(matches, False)
#     print(val)
#     canContinue = val != False
#
# business_list

#business = business[0:100]

count = 0

bus_list = []

for bus in business:
    count += 1

    bus_prep = bus
    bus_par = {
        "_id":{
            "$oid":ObjectId().__str__()
        },
        b_f[0]:bus[0],
        b_f[1]:bus[1],
        b_f[2]:bus[2],
        b_f[3]:bus[3],
        b_f[4]:bus[4],
        b_f[5]:bus[5],
        b_f[6]:bus[6],
        b_f[7]:bus[7],
        b_f[8]:bus[8],
        b_f[9]:bus[9],
        b_f[10]:bus[10],
        b_f[11]:bus[11],
        b_f[12]:bus[12],
        b_f[13]:bus[13],
        b_f[14]:bus[14],
        b_f[15]:bus[15],
        b_f[16]:bus[16],
        b_f[17]:bus[17],
        b_f[18]:bus[18],
        b_f[19]:bus[19],
        'inspections':[]
    }

    if bus_par['supervisor_district'] == "":
        bus_par['supervisor_district'] = randint(1,11)


    if bus_par['business_location'] == "" and bus_par['Business Location'] != "":
        location = bus_par['Business Location'][7:-1].split()
        bus_par['business_latitude'] = location[1]
        bus_par['business_longitude'] = location[0]
        bus_par['business_location'] = bus_par['Business Location']


    for intConv in ['mail_zipcode', 'business_postal_code', 'business_id', 'business_account_number', 'supervisor_district']:
        if bus_par[intConv] != "" and not isinstance(bus_par[intConv], int):
            bus_par[intConv] = int(bus_par[intConv])


    del bus_par['Business Location']

    ins_match = (x for x in inspection if bus[0] == x[0])

    ins_list = []
    ins_val = True
    while ins_val != False:
        ins_val = next(ins_match, False)
        if ins_val != False:
            ins_par = {
                "_id":{
                    "$oid":ObjectId().__str__()
                },
                i_f[1]:ins_val[1],
                i_f[2]:ins_val[2],
                i_f[3]:ins_val[3],
                i_f[4]:ins_val[4],
                'violations':[]
            }
            if ins_par["inspection_score"] != "" and not isinstance(ins_par["inspection_score"], int):
                ins_par["inspection_score"] = int(ins_par["inspection_score"])

            vio_match = (x for x in violation if ins_val[1] == x[1])

            vio_list = []
            vio_val = True
            while vio_val != False:
                vio_val = next(vio_match, False)
                if vio_val != False:
                    vio_par = {
                        "_id":{
                            "$oid":ObjectId().__str__()
                        },
                        v_f[2]:vio_val[2],
                        v_f[3]:vio_val[3],
                        v_f[4]:vio_val[4]
                    }
                    #vio_list.append(vio_val[2:])
                    vio_list.append(vio_par)
            #ins_val.append(vio_list)
            ins_par['violations'] = vio_list

            ins_list.append(ins_par)
    #bus_prep.append(ins_list)

    bus_par['inspections'] = ins_list
    #bus_list.append(bus_prep)
    bus_list.append(bus_par)

    if count % 100 == 0:
        print(str((count*100) // business_size) + '% of records imported')
     #there is no link - got to create one


print(bus[0])
print(b_f)
print(business[0])
print('\n')
print(i_f)
print(inspection[0])
print('\n')
print(v_f)
print(violation[0])
print('\n')

#print(jsonify(bus_list))
to_json = json.dumps(bus_list, indent=4, sort_keys=True)
print('to_json')
print(to_json)

file = open("P:\\Final year\\COM633- Full Stack\\database backups\\output.json","w+")
#file.write(jsonify(bus_list))
file.write(to_json)
file.close()

'''

with open('D:\\Documents\\Final year\\Full stack\\mongodb-san-fran.json') as json_file:
 data = json.load(json_file)

print(data[0]['inspections'][3]['inspection_date'])
print(data[0]['inspections'][3]['violations'][0]['risk_category'])
print(data[0]['inspections'][3]['violations'])
print(data[0]['inspections'][3]['inspection_score'])
print(data[0]['inspections'][3]['inspection_type'])
# print(data[0]['reviews'])

# json.dumps(data, indent=4)

bad_to_good_reviews = [[
  ['JUST NO!!'],
  ['Microwaved frozen food'],
  ['HORRIBLE !!'],
  ['AWFUL!!'],
  ['Worst service ever!'],
  ['Horrible place, stay away!'],
  ['Never again.'],
  ['My most unpleasant dining,unfortunately'],
  ['All the staffs of this place are THIEFS'],
  ['Absolute dire']
], [
  ['Might look good on social media'],
  ['CONTINUE to improve!!!'],
  ['Rapha needs to do some work here'],
  ['Not again'],
  ['Tourist extortion'],
  ['Ripped off'],
  ['Totally unauthentic'],
  ['Skip this Restaurant'],
  ['Very unprofessional'],
  ['Poor']
], [
  ['40th Birthday with my Family'],
  ['Nice atmosphere and meh staff'],
  ['Great view but horrible food'],
  ['Overpriced'],
  ['Not the best, but not the worst neither'],
  ['Poor service, food average'],
  ['It was too cold to stay'],
  ['Birthday party'],
  ['Food nice but place is dirty'],
  ['Misleading prices']
], [
  ['A treat!'],
  ['Great Experience'],
  ['A hidden gem'],
  ['Fantastic!'],
  ['Love it!'],
  ['Such a cool space and tasty food'],
  ['Excellent service'],
  ['Hotspot with delicious food'],
  ['A cosy and warm place'],
  ['Unexpected lovely dinner'],
], [
  ['Just like home'],
  ['Great food and staff'],
  ['Satisfaction'],
  ['True five star dinner'],
  ['Best meal.... EVER'],
  ['Wow just Wow'],
  ['Lovely dinner in a cozy lovely space'],
  ['Hidden gem'],
  ['Excellent']
]]


def review_gen(g_l, g_u, m_l, m_u, b_l, b_u, date):
  review_list = []

  struct = [
    [0, [3, 4]],
    [0, [1, 3]],
    [0, [0, 1]]
  ]

  if g_u > 0:
    struct[0][0] = randint(g_l, g_u)
  if m_u > 0:
    struct[1][0] = randint(m_l, m_u)
  if b_u > 0:
    struct[2][0] = randint(b_l, b_u)

  for review_view in struct:
    review_count = review_view[0]
    review_rating_lower = review_view[1][0]
    review_rating_higher = review_view[1][1]
    for review in range(review_count):
      rating_random = randint(review_rating_lower, review_rating_higher)
      review_text = bad_to_good_reviews[rating_random][randint(0, len(bad_to_good_reviews[rating_random])-1)]
      review_list.append([review_text, rating_random + 1])
  reviews_prepared = []
  for review in review_list:
    minutes = randint(0, 60*24*7)

    review_obj = {
      "_id": {"$oid": ObjectId().__str__()},
      "username": None,
      "votes":{
        "up": 0,
        "down": 0
      },
      "text": review[0][0],
      "stars": review[1],
      "date": (date - datetime.timedelta(minutes=minutes)).strftime('%Y/%m/%d %H:%M:%S')
    }
    reviews_prepared.append(review_obj)
  return reviews_prepared


for business in data:
  reviews = []
  business['inspection_count'] = len(business['inspections'])
  business_start_date = datetime.datetime.strptime(business['business_start_date'], '%m/%d/%Y')
  business['business_start_date'] = business_start_date.strftime('%Y/%m/%d %H:%M:%S')
  for field in ['business_latitude','business_location','business_longitude','business_phone_number','mail_address','mail_city','mail_state','mail_zipcode','business_phone_number']:
    if business[field] == '':
      business[field] = None

  for inspection in business['inspections']:
    inspection_date = datetime.datetime.strptime(inspection['inspection_date'], '%m/%d/%Y %I:%M:%S %p')
    inspection['inspection_date'] = inspection_date.strftime('%Y/%m/%d %H:%M:%S')
    for field in ['inspection_score']:
      if inspection[field] == '':
        inspection[field] = None

    review_min_max = {
      'good_l': 0,
      'meh_l': 0,
      'bad_l': 0,
      'good_u': 1,
      'meh_u': 1,
      'bad_u': 0,
      'date': inspection_date - datetime.timedelta(days=7)
    }

    inspection['violation_count'] = len(inspection['violations'])
    for violation in inspection['violations']:

      if violation['risk_category'] in ["Complaint", "Complaint Reinspection/Followup", "Foodborne Illness Investigation", "Community Health Assessment"]:
        review_min_max['bad_l'] += 1
        review_min_max['bad_u'] += 2
      if violation['risk_category'] == "High Risk":
        review_min_max['bad_u'] += 2
      elif violation['risk_category'] == "Moderate Risk":
        review_min_max['meh_u'] += 2
      else:
        review_min_max['meh_u'] += 1
      if inspection['inspection_score'] is not None:
        if inspection['inspection_score'] < 33:
          review_min_max['bad_u'] += 1
        elif inspection['inspection_score'] < 66:
          review_min_max['meh_u'] += 1
        else:
          review_min_max['good_u'] += 1


    reviews.extend(review_gen(
      review_min_max['good_l'],
      review_min_max['good_u'],
      review_min_max['meh_l'],
      review_min_max['meh_u'],
      review_min_max['bad_l'],
      review_min_max['bad_u'],
      review_min_max['date']
    ))
  #print(reviews)
  business['reviews'] = reviews
  business['review_count'] = len(business['reviews'])


to_json = json.dumps(data, indent=4, sort_keys=True)
print('to_json')
print(to_json)

file = open('D:\\Documents\\Final year\\Full stack\\mongodb-san-fran-2.json',"w+")
#file.write(jsonify(bus_list))
file.write(to_json)

#TODO review_count
