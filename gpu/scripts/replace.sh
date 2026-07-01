\
# Topic Selector → Agent Router
sed -i '' 's/Topic Selector/Agent Router/g' agentforce.html && \
# Connected Agent → Connected Subagent
sed -i '' 's/Connected Agent/Connected Subagent/g' agentforce.html && \
echo "done"