import subprocess
import os
import json
import logging
import botocore

logger = logging.getLogger()
logger.setLevel(logging.INFO)

os.environ['PATH'] = '/opt/eksctl:' + os.environ['PATH']

outdir = os.environ.get('TEST_OUTDIR', '/tmp')


def handler(event, context):
    try:
        logger.info(json.dumps(event))
        cmnd = ['eksctl', 'version']
        output = subprocess.check_output(cmnd, stderr=subprocess.STDOUT)
        # output = str(output)
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
