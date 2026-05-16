pipeline {
    agent {
        label 'dev'
    }

    environment {
        // Replace this with your GitHub repository URL.
        GIT_REPO_URL = 'https://github.com/tanmayanand840/chat-app.git'

        // Set this to your Docker Hub username.
        DOCKERHUB_USERNAME = 'tanmayanand24'

        CLIENT_IMAGE = "${DOCKERHUB_USERNAME}/chat-client"
        SERVER_IMAGE = "${DOCKERHUB_USERNAME}/chat-server"
        IMAGE_TAG = 'latest'

        // Replace these values with your EC2 deployment user and host.
        DEPLOY_USER = 'ubuntu'
        DEPLOY_HOST = 'YOUR_EC2_PUBLIC_IP'
        DEPLOY_TARGET = "${DEPLOY_USER}@${DEPLOY_HOST}"

        CLIENT_CONTAINER = 'chat-client'
        SERVER_CONTAINER = 'chat-server'
        DOCKER_NETWORK = 'chat-app-network'

        CLIENT_PORT = '5173'
        SERVER_PORT = '5000'

        // Create this file on EC2 with backend secrets such as JWT, MongoDB, and Cloudinary values.
        SERVER_ENV_FILE = '/opt/chat-app/server.env'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Clone Repository') {
            steps {
                // Clean workspace first so every build starts from a fresh checkout.
                cleanWs()

                // Clone the MERN chat application source code from GitHub.
                git branch: 'main', url: "${GIT_REPO_URL}"
            }
        }

        stage('Build Client Image') {
            steps {
                // Build the React + Vite frontend Docker image.
                sh '''
                    set -e
                    docker build \
                      -t "$CLIENT_IMAGE:$IMAGE_TAG" \
                      ./client
                '''
            }
        }

        stage('Build Server Image') {
            steps {
                // Build the Node.js + Express backend Docker image.
                sh '''
                    set -e
                    docker build \
                      -t "$SERVER_IMAGE:$IMAGE_TAG" \
                      ./server
                '''
            }
        }

        stage('Docker Login') {
            steps {
                // Login securely using Jenkins credentials with ID: dockerhub.
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_TOKEN'
                )]) {
                    sh '''
                        set -e
                        echo "$DOCKERHUB_TOKEN" | docker login \
                          -u "$DOCKERHUB_USER" \
                          --password-stdin
                    '''
                }
            }
        }

        stage('Push Client Image') {
            steps {
                // Push the frontend image to Docker Hub.
                sh '''
                    set -e
                    docker push "$CLIENT_IMAGE:$IMAGE_TAG"
                '''
            }
        }

        stage('Push Server Image') {
            steps {
                // Push the backend image to Docker Hub.
                sh '''
                    set -e
                    docker push "$SERVER_IMAGE:$IMAGE_TAG"
                '''
            }
        }

        stage('Deploy Application') {
            steps {
                // SSH into the EC2 deployment server and replace old containers with the latest images.
                sshagent(credentials: ['agent-ssh']) {
                    sh '''
                        set -e

                        ssh -o StrictHostKeyChecking=no "$DEPLOY_TARGET" "
                            set -e

                            echo 'Creating Docker network if it does not exist...'
                            docker network create $DOCKER_NETWORK || true

                            echo 'Pulling latest Docker images...'
                            docker pull $CLIENT_IMAGE:$IMAGE_TAG
                            docker pull $SERVER_IMAGE:$IMAGE_TAG

                            echo 'Stopping old containers if they are running...'
                            docker stop $CLIENT_CONTAINER || true
                            docker stop $SERVER_CONTAINER || true

                            echo 'Removing old containers if they exist...'
                            docker rm $CLIENT_CONTAINER || true
                            docker rm $SERVER_CONTAINER || true

                            echo 'Starting backend container...'
                            docker run -d \\
                              --name $SERVER_CONTAINER \\
                              --restart unless-stopped \\
                              --network $DOCKER_NETWORK \\
                              --network-alias backend \\
                              --env-file $SERVER_ENV_FILE \\
                              -e NODE_ENV=production \\
                              -e PORT=$SERVER_PORT \\
                              -e CLIENT_URL=http://$DEPLOY_HOST:$CLIENT_PORT \\
                              -p $SERVER_PORT:$SERVER_PORT \\
                              $SERVER_IMAGE:$IMAGE_TAG

                            echo 'Starting frontend container...'
                            docker run -d \\
                              --name $CLIENT_CONTAINER \\
                              --restart unless-stopped \\
                              --network $DOCKER_NETWORK \\
                              -p $CLIENT_PORT:$CLIENT_PORT \\
                              $CLIENT_IMAGE:$IMAGE_TAG

                            echo 'Deployment completed successfully.'
                            docker ps --filter name=$SERVER_CONTAINER --filter name=$CLIENT_CONTAINER
                        "
                    '''
                }
            }
        }
    }

    post {
        always {
            // Logout after the pipeline finishes so credentials are not kept active.
            sh '''
                docker logout || true
            '''
        }

        success {
            echo 'CI/CD pipeline completed successfully. Images were built, pushed, and deployed.'
        }

        failure {
            echo 'CI/CD pipeline failed. Check the stage logs above for the exact error.'
        }
    }
}
