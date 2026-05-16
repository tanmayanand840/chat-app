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
    }

    post {
        always {
            // Logout after the pipeline finishes so credentials are not kept active.
            sh '''
                docker logout || true
            '''
        }

        success {
            echo 'CI pipeline completed successfully. Images were built and pushed to Docker Hub.'
        }

        failure {
            echo 'CI pipeline failed. Check the stage logs above for the exact error.'
        }
    }
}
