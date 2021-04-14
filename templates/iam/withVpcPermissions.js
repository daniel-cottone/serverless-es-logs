module.exports = {
    Effect: "Allow",
    Action: [
        "ec2:CreateNetworkInterface",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DeleteNetworkInterface"
    ],
    Resource: "*"
  }
