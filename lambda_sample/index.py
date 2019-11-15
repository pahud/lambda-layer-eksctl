import subprocess
import os
import json
import logging
import botocore

logger = logging.getLogger()
logger.setLevel(logging.INFO)

os.environ['PATH'] = '/opt/eksctl:' + os.environ['PATH']

outdir = os.environ.get('TEST_OUTDIR', '/tmp')


def eksctl(*args, **kwargs):
    output = subprocess.check_output(['eksctl']+list(args), stderr=subprocess.STDOUT)
    # remove the bytes in the beginning to avoid  the output break
    output = " ".join(str(output.strip()).split(' ')[2:])
    return output


def handler(event, context):
    try:
        logger.info(json.dumps(event))
        cmnd = ['eksctl', 'version']
        output = subprocess.check_output(cmnd, stderr=subprocess.STDOUT)
        output = " ".join(str(output.strip()).split(' ')[2:])
    except subprocess.CalledProcessError as exc:
        raise Exception(exc.output)
    else:
        logger.info(output)
    resp = {
        'statusCode': '200',
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': output
    }
    return resp


def on_event(event, context):
    print(event)
    request_type = event['RequestType']
    if request_type == 'Create':
        return on_create(event)
    if request_type == 'Update':
        return on_update(event)
    if request_type == 'Delete':
        return on_delete(event)
    raise Exception("Invalid request type: %s" % request_type)


def on_create(event):
    props = event["ResourceProperties"]
    print("create new resource with props %s" % props)

    # add your create code here...
    physical_id = 'eksctlOutput'
    data = {}
    data['phase'] = 'on_create'
    data['result'] = eksctl('version')
    return {'PhysicalResourceId': physical_id, 'Data': data}


def on_update(event):
    physical_id = event["PhysicalResourceId"]
    props = event["ResourceProperties"]
    print("update resource %s with props %s" % (physical_id, props))
    # ...
    data = {}
    data['phase'] = 'on_update'
    data['result'] = eksctl('version')
    return {'PhysicalResourceId': physical_id, 'Data': data}


def on_delete(event):
    physical_id = event["PhysicalResourceId"]
    print("delete resource %s" % physical_id)
    # ...
