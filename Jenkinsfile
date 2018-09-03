pipeline {
    agent any
    environment {
        HOME = '.'
    }
    stages {
        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t dariusbakunas/homeportal-api:${env.BRANCH_NAME} ."
                }
            }
        }
        stage('Push image') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'PASSWORD', usernameVariable: 'USERNAME')]) {
                        sh "docker login --password=${PASSWORD} --username=${USERNAME}"
                        sh "docker push dariusbakunas/homeportal-api:${env.BRANCH_NAME}"
                    }
                }
            }
        }
        stage('Deploy to kubernetes') {
            steps {
                sh 'envsubst < k8s/deployment.yml > deployment.yml'
                sh 'scp *.yml jenkins@kube-master-1.local.geekspace.us:~'
                sh 'ssh -t jenkins@kube-master-1.local.geekspace.us "/usr/bin/kubectl get secret regcred --namespace=default --export -o yaml | /usr/bin/kubectl apply --namespace=${BRANCH_NAME} -f -"'
                sh 'ssh -t jenkins@kube-master-1.local.geekspace.us /usr/bin/kubectl apply -f deployment.yml'
            }
        }
    }
}
